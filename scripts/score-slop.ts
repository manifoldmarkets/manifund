// One-off: score the newest 20 public projects for AI-generated text (Pangram)
// and slop quality (Claude Sonnet 5 rubric judge, via OpenRouter for now).
// Run with: bun run scripts/score-slop.ts
import { createAdminClient } from '@/db/edge'
import { toMarkdown } from '@/utils/tiptap-parsing'
import { JSONContent } from '@tiptap/core'
import OpenAI from 'openai'

const PANGRAM_API_KEY = process.env.PANGRAM_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
if (!PANGRAM_API_KEY) throw new Error('Missing PANGRAM_API_KEY')
if (!OPENROUTER_API_KEY) throw new Error('Missing OPENROUTER_API_KEY')

const openrouter = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

type PangramResult = {
  fraction_ai: number
  fraction_ai_assisted: number
  headline: string
}

async function scorePangram(text: string): Promise<PangramResult> {
  const createRes = await fetch('https://text.external-api.pangram.com/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': PANGRAM_API_KEY! },
    body: JSON.stringify({ text }),
  })
  if (!createRes.ok) {
    throw new Error(`Pangram task create failed: ${createRes.status} ${await createRes.text()}`)
  }
  const { task_id } = (await createRes.json()) as { task_id: string }

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const pollRes = await fetch(`https://text.external-api.pangram.com/task/${task_id}`, {
      headers: { 'x-api-key': PANGRAM_API_KEY! },
    })
    if (!pollRes.ok) {
      throw new Error(`Pangram poll failed: ${pollRes.status} ${await pollRes.text()}`)
    }
    const task = (await pollRes.json()) as any
    if (task.stage === 'STAGE_SUCCESS') {
      const result = task.result ?? task
      return {
        fraction_ai: result.fraction_ai ?? 0,
        fraction_ai_assisted: result.fraction_ai_assisted ?? 0,
        headline: result.headline ?? '',
      }
    }
    if (task.stage === 'STAGE_FAILED') {
      throw new Error(`Pangram task failed: ${JSON.stringify(task).slice(0, 300)}`)
    }
  }
  throw new Error('Pangram task timed out after 120s')
}

type QualityResult = {
  quality_score: number
  is_slop: boolean
  reason: string
}

const RUBRIC = `You are reviewing a funding application posted on Manifund, a platform for grants in AI safety, EA, forecasting, and adjacent causes. Score it for substance, not writing polish.

Rubric (each hurts the score when absent or bad):
- Concrete plan: specific activities, milestones, or deliverables vs. vague aspirations
- Budget clarity: says what the money is actually for
- Track record: evidence the person/team exists and has done relevant things
- Falsifiability: could a funder later tell whether this succeeded?
- Grandiose or generic claims: sweeping impact claims with no mechanism, buzzword salad, boilerplate that could describe any project

Respond with ONLY a JSON object, no markdown fences:
{"quality_score": <1-10, 10 = excellent substantive proposal>, "is_slop": <true if a thoughtful funder would consider this low-effort filler>, "reason": "<one sentence>"}`

async function scoreQuality(text: string): Promise<QualityResult> {
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-sonnet-5',
    max_tokens: 300,
    messages: [
      { role: 'system', content: RUBRIC },
      { role: 'user', content: text },
    ],
  })
  const raw = completion.choices[0]?.message?.content ?? ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Judge returned non-JSON: ${raw.slice(0, 200)}`)
  return JSON.parse(match[0]) as QualityResult
}

function projectText(p: {
  title: string
  blurb: string | null
  description: JSONContent | null
}): string {
  const sections = [`# ${p.title}`]
  if (p.blurb) sections.push(p.blurb)
  if (p.description) {
    const md = toMarkdown(p.description)
    if (md.trim()) sections.push(md)
  }
  return sections.join('\n\n').slice(0, 20000)
}

async function main() {
  const supabase = createAdminClient()
  const { data: projects } = await supabase
    .from('projects')
    .select(
      'id, slug, title, blurb, description, created_at, profiles!projects_creator_fkey(username)'
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .limit(20)
    .throwOnError()

  console.log(`Scoring ${projects!.length} projects...\n`)

  type Row = {
    slug: string
    created: string
    words: number
    pangram: PangramResult | { error: string }
    quality: QualityResult | { error: string }
  }
  const rows: Row[] = []

  // Batches of 5 to be polite to both APIs
  for (let i = 0; i < projects!.length; i += 5) {
    const batch = projects!.slice(i, i + 5)
    const results = await Promise.all(
      batch.map(async (p) => {
        const text = projectText(p as any)
        const [pangram, quality] = await Promise.all([
          scorePangram(text).catch((e) => ({ error: String(e.message ?? e) })),
          scoreQuality(text).catch((e) => ({ error: String(e.message ?? e) })),
        ])
        return {
          slug: p.slug,
          created: p.created_at.slice(0, 10),
          words: text.split(/\s+/).length,
          pangram,
          quality,
        }
      })
    )
    rows.push(...results)
    console.log(`  ...${Math.min(i + 5, projects!.length)}/${projects!.length} done`)
  }

  const fmtPct = (n: number) => `${Math.round(n * 100)}%`.padStart(4)
  const sorted = rows.sort((a, b) => {
    const fa = 'fraction_ai' in a.pangram ? a.pangram.fraction_ai : -1
    const fb = 'fraction_ai' in b.pangram ? b.pangram.fraction_ai : -1
    return fb - fa
  })

  console.log(
    '\nslug'.padEnd(41) +
      'date'.padEnd(12) +
      'words'.padEnd(7) +
      'AI'.padEnd(6) +
      'AI-asst'.padEnd(9) +
      'qual'.padEnd(6) +
      'slop?  reason'
  )
  console.log('-'.repeat(130))
  for (const r of sorted) {
    const pg =
      'error' in r.pangram
        ? 'ERR '.padEnd(6) + ''.padEnd(9)
        : fmtPct(r.pangram.fraction_ai).padEnd(6) + fmtPct(r.pangram.fraction_ai_assisted).padEnd(9)
    const q =
      'error' in r.quality
        ? 'ERR'.padEnd(6) + '       ' + r.quality.error.slice(0, 60)
        : String(r.quality.quality_score).padEnd(6) +
          (r.quality.is_slop ? 'YES    ' : 'no     ') +
          r.quality.reason.slice(0, 70)
    console.log(
      r.slug.slice(0, 39).padEnd(41) + r.created.padEnd(12) + String(r.words).padEnd(7) + pg + q
    )
  }

  const scored = rows.filter((r) => 'fraction_ai' in r.pangram) as (Row & {
    pangram: PangramResult
  })[]
  if (scored.length > 0) {
    const buckets = [0, 0.25, 0.5, 0.75, 1.01]
    console.log('\nfraction_ai distribution:')
    for (let b = 0; b < buckets.length - 1; b++) {
      const count = scored.filter(
        (r) => r.pangram.fraction_ai >= buckets[b] && r.pangram.fraction_ai < buckets[b + 1]
      ).length
      console.log(
        `  ${fmtPct(buckets[b])}-${fmtPct(Math.min(buckets[b + 1], 1))}: ${'#'.repeat(count)} (${count})`
      )
    }
    const flagged = rows.filter(
      (r) =>
        'is_slop' in r.quality &&
        r.quality.is_slop &&
        'fraction_ai' in r.pangram &&
        r.pangram.fraction_ai > 0.5
    )
    console.log(`\nMostly-AI (>50%) AND judged slop: ${flagged.length}/${rows.length}`)
  }

  const errors = rows.filter((r) => 'error' in r.pangram || 'error' in r.quality)
  if (errors.length > 0) {
    console.log(`\n${errors.length} rows had errors:`)
    for (const r of errors) {
      if ('error' in r.pangram)
        console.log(`  ${r.slug} [pangram]: ${r.pangram.error.slice(0, 150)}`)
      if ('error' in r.quality) console.log(`  ${r.slug} [judge]: ${r.quality.error.slice(0, 150)}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
