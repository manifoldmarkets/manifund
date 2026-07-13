import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/core'
import { toMarkdown } from '@/utils/tiptap-parsing'
import OpenAI from 'openai'

// Scores every public project two ways:
// - Pangram (fraction_ai): how much of the text reads as AI-generated.
//   Drives the default "hide slop" feed filter and the card/page flags.
// - LLM rubric (quality_score, 1-10): substance of the proposal, shown on the
//   project page as context but not used for hiding (the judge rates
//   plausible-sounding slop too generously to be an enforcement signal).

const PANGRAM_BASE = 'https://text.external-api.pangram.com'
const JUDGE_MODEL = 'anthropic/claude-sonnet-5'

export function hasScoringKeys() {
  return Boolean(process.env.PANGRAM_API_KEY) && Boolean(process.env.OPENROUTER_API_KEY)
}

export type PangramScore = {
  fraction_ai: number
  fraction_ai_assisted: number
  raw: Record<string, unknown>
}

async function scorePangram(text: string): Promise<PangramScore> {
  const apiKey = process.env.PANGRAM_API_KEY
  if (!apiKey) throw new Error('Missing PANGRAM_API_KEY')

  const createRes = await fetch(`${PANGRAM_BASE}/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ text }),
  })
  if (!createRes.ok) {
    throw new Error(`Pangram task create failed: ${createRes.status} ${await createRes.text()}`)
  }
  const { task_id } = (await createRes.json()) as { task_id: string }

  for (let i = 0; i < 60; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const pollRes = await fetch(`${PANGRAM_BASE}/task/${task_id}`, {
      headers: { 'x-api-key': apiKey },
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
        raw: result,
      }
    }
    if (task.stage === 'STAGE_FAILED') {
      throw new Error(`Pangram task failed: ${JSON.stringify(task).slice(0, 300)}`)
    }
  }
  throw new Error('Pangram task timed out after 120s')
}

export type QualityScore = {
  quality_score: number
  is_slop: boolean
  reason: string
}

const QUALITY_RUBRIC = `You are reviewing a funding application posted on Manifund, a platform for grants in AI safety, EA, forecasting, and adjacent causes. Score it for substance, not writing polish.

Rubric (each hurts the score when absent or bad):
- Concrete plan: specific activities, milestones, or deliverables vs. vague aspirations
- Budget clarity: says what the money is actually for
- Track record: evidence the person/team exists and has done relevant things
- Falsifiability: could a funder later tell whether this succeeded?
- Grandiose or generic claims: sweeping impact claims with no mechanism, buzzword salad, boilerplate that could describe any project

Be skeptical: fluent, well-structured text with precise-sounding numbers is not evidence of substance. Verifiable artifacts (real repos, named collaborators, prior published work) are.

Respond with ONLY a JSON object, no markdown fences:
{"quality_score": <1-10, 10 = excellent substantive proposal>, "is_slop": <true if a thoughtful funder would consider this low-effort filler>, "reason": "<one sentence>"}`

async function scoreQuality(text: string): Promise<QualityScore> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')
  const openrouter = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })

  // Generous budget: Sonnet 5 thinks adaptively by default and reasoning
  // tokens count against max_tokens; too low a cap truncates the JSON.
  const completion = await openrouter.chat.completions.create({
    model: JUDGE_MODEL,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: QUALITY_RUBRIC },
      { role: 'user', content: text },
    ],
  })
  const raw = completion.choices[0]?.message?.content ?? ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Judge returned non-JSON: ${raw.slice(0, 200)}`)
  const parsed = JSON.parse(match[0]) as QualityScore
  if (typeof parsed.quality_score !== 'number') {
    throw new Error(`Judge returned invalid quality_score: ${match[0].slice(0, 200)}`)
  }
  return parsed
}

export function createProjectScoringText(project: {
  title: string
  blurb: string | null
  description: JSONContent | null
}): string {
  const sections = [`# ${project.title}`]
  if (project.blurb) sections.push(project.blurb)
  if (project.description) {
    const descriptionText = toMarkdown(project.description)
    if (descriptionText.trim()) sections.push(descriptionText)
  }
  return sections.join('\n\n').slice(0, 20000)
}

async function hashText(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Scores one project and persists results. Never throws on individual API
// failures: whichever score succeeds is saved, and content_hash is only
// written once both succeed so the nightly sync retries the missing half.
export async function scoreProject(
  supabase: SupabaseClient,
  projectId: string,
  options: { force?: boolean } = {}
): Promise<{ status: 'scored' | 'partial' | 'skipped' | 'failed'; errors: string[] }> {
  const { data: project } = await supabase
    .from('projects')
    .select('id, title, blurb, description')
    .eq('id', projectId)
    .single()
    .throwOnError()

  const text = createProjectScoringText(project as any)
  const contentHash = await hashText(text)

  const { data: existing } = await supabase
    .from('project_scores')
    .select('content_hash')
    .eq('project_id', projectId)
    .maybeSingle()

  if (!options.force && existing?.content_hash === contentHash) {
    return { status: 'skipped', errors: [] }
  }

  const [pangram, quality] = await Promise.allSettled([scorePangram(text), scoreQuality(text)])

  const errors: string[] = []
  const scoreRow: Record<string, unknown> = {
    project_id: projectId,
    scored_at: new Date().toISOString(),
  }
  const projectUpdate: Record<string, unknown> = {}

  if (pangram.status === 'fulfilled') {
    scoreRow.pangram_fraction_ai = pangram.value.fraction_ai
    scoreRow.pangram_fraction_ai_assisted = pangram.value.fraction_ai_assisted
    scoreRow.pangram_raw = pangram.value.raw
    projectUpdate.ai_fraction = pangram.value.fraction_ai
  } else {
    errors.push(`pangram: ${pangram.reason?.message ?? pangram.reason}`)
  }

  if (quality.status === 'fulfilled') {
    scoreRow.quality_score = quality.value.quality_score
    scoreRow.quality_raw = quality.value
    projectUpdate.quality_score = quality.value.quality_score
  } else {
    errors.push(`judge: ${quality.reason?.message ?? quality.reason}`)
  }

  if (pangram.status === 'fulfilled' && quality.status === 'fulfilled') {
    scoreRow.content_hash = contentHash
  }

  if (Object.keys(projectUpdate).length === 0) {
    return { status: 'failed', errors }
  }

  await supabase
    .from('project_scores')
    .upsert(scoreRow as any, { onConflict: 'project_id', ignoreDuplicates: false })
    .throwOnError()
  await supabase.from('projects').update(projectUpdate).eq('id', projectId).throwOnError()

  return { status: errors.length === 0 ? 'scored' : 'partial', errors }
}

export async function syncProjectScores(
  supabase: SupabaseClient,
  options: {
    batchSize?: number
    limit?: number
    force?: boolean
    onProgress?: (progress: { processed: number; total: number; currentProject?: string }) => void
  }
) {
  const { batchSize = 5, limit = 100, force = false, onProgress } = options

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, blurb, description, project_scores(content_hash)')
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .throwOnError()

  const candidates = []
  for (const project of projects ?? []) {
    // One-to-one relation: PostgREST returns an object when the FK is the PK,
    // but an array otherwise - handle both
    const scores = project.project_scores as
      | { content_hash: string | null }
      | { content_hash: string | null }[]
      | null
    const existingHash =
      (Array.isArray(scores) ? scores[0]?.content_hash : scores?.content_hash) ?? null
    if (force || !existingHash) {
      candidates.push(project)
      continue
    }
    const hash = await hashText(createProjectScoringText(project as any))
    if (hash !== existingHash) candidates.push(project)
  }

  const toProcess = candidates.slice(0, limit)
  const results = {
    total: toProcess.length,
    scored: 0,
    partial: 0,
    failed: 0,
    errors: [] as string[],
  }
  let processed = 0

  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize)
    const outcomes = await Promise.all(
      batch.map((project) =>
        scoreProject(supabase, project.id, { force }).catch((e) => ({
          status: 'failed' as const,
          errors: [String(e?.message ?? e)],
        }))
      )
    )
    outcomes.forEach((outcome, j) => {
      if (outcome.status === 'scored' || outcome.status === 'skipped') results.scored++
      else if (outcome.status === 'partial') results.partial++
      else results.failed++
      results.errors.push(...outcome.errors.map((e) => `${batch[j].title}: ${e}`))
      processed++
      onProgress?.({ processed, total: toProcess.length, currentProject: batch[j].title })
    })
  }

  return results
}
