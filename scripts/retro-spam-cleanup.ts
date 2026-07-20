// One-time retroactive spam cleanup for existing projects.
//
// Two phases, both resumable via a local cache file so you never re-pay for
// classification or re-email on a re-run:
//   Phase 1 (classify): classify every non-draft project with the production
//     spam classifier (Sonnet -> Haiku -> fail-open), caching verdicts to
//     scripts/.retro-spam-cache.json.
//   Phase 2 (plan + act): group spam projects by creator and decide per account:
//       - ALL of the account's projects are spam  -> BAN the account
//       - account has some legit projects too      -> HIDE the spam ones only
//     then print the plan. With --apply, execute it (email the creator first,
//     then ban / hide).
//
// Safety: never bans an admin, a non-individual profile (e.g. amm), or an
// account with any money activity (bids or USD txns); those are downgraded to
// "hide + flag for manual review" instead of an automatic ban. DRY RUN unless
// --apply is passed. Applied actions are logged to scripts/.retro-spam-actions.json
// and skipped on re-run.
//
// Requires OPENROUTER_API_KEY in the environment (the prod value; not in
// .env.local). Usage:
//   OPENROUTER_API_KEY=sk-or-... bun run scripts/retro-spam-cleanup.ts               # dry run
//   OPENROUTER_API_KEY=sk-or-... bun run scripts/retro-spam-cleanup.ts --classify    # phase 1 only
//   OPENROUTER_API_KEY=sk-or-... bun run scripts/retro-spam-cleanup.ts --apply       # execute

import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/db/edge'
import { classifyProjectSpam, type SpamVerdict } from '@/app/utils/spam-scores'
import { superbanUser } from '@/db/superban'
import { isAdmin } from '@/db/profile'
import { getUserEmail, sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { toMarkdown } from '@/utils/tiptap-parsing'
import { getURL } from '@/utils/constants'

const CACHE = path.join(import.meta.dir, '.retro-spam-cache.json')
const ACTIONS = path.join(import.meta.dir, '.retro-spam-actions.json')
const CONCURRENCY = 6
const APPLY = process.argv.includes('--apply')
const CLASSIFY_ONLY = process.argv.includes('--classify')

type CachedVerdict = SpamVerdict & {
  title: string
  slug: string
  creator: string
  stage: string
}

function loadJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as T) : fallback
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) await worker(items[i++])
    })
  )
}

// ---- Phase 1: classify every non-draft project ----
async function classifyAll(supabase: ReturnType<typeof createAdminClient>) {
  const cache = loadJson<Record<string, CachedVerdict>>(CACHE, {})

  let all: any[] = []
  let from = 0
  const page = 1000
  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, blurb, slug, creator, description, stage')
      .neq('stage', 'draft')
      .range(from, from + page - 1)
    if (error) throw error
    all = all.concat(data ?? [])
    if (!data || data.length < page) break
    from += page
  }

  const todo = all.filter((p) => !cache[p.id])
  console.log(`Phase 1: ${all.length} non-draft projects, ${todo.length} to classify`)

  let done = 0
  await runPool(todo, async (p) => {
    const verdict = await classifyProjectSpam(p)
    cache[p.id] = { ...verdict, title: p.title, slug: p.slug, creator: p.creator, stage: p.stage }
    if (++done % 50 === 0) {
      fs.writeFileSync(CACHE, JSON.stringify(cache))
      console.log(`  classified ${done}/${todo.length}`)
    }
  })
  fs.writeFileSync(CACHE, JSON.stringify(cache))
  const spamCount = Object.values(cache).filter((v) => v.is_spam).length
  console.log(`Phase 1 done. ${Object.keys(cache).length} cached, ${spamCount} flagged spam.`)
  return cache
}

// ---- Phase 2: plan per-creator actions ----
type CreatorPlan = {
  creator: string
  action: 'ban' | 'hide' | 'review'
  spamProjectIds: string[]
  reason: string
}

async function buildPlan(
  supabase: ReturnType<typeof createAdminClient>,
  cache: Record<string, CachedVerdict>
): Promise<CreatorPlan[]> {
  // Group classified projects by creator.
  const byCreator: Record<string, { spam: string[]; legit: string[] }> = {}
  for (const [id, v] of Object.entries(cache)) {
    ;(byCreator[v.creator] ??= { spam: [], legit: [] })[v.is_spam ? 'spam' : 'legit'].push(id)
  }
  const spamCreators = Object.entries(byCreator).filter(([, g]) => g.spam.length > 0)

  const plans: CreatorPlan[] = []
  for (const [creator, g] of spamCreators) {
    // Safety guards that block an automatic ban.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, type')
      .eq('id', creator)
      .maybeSingle()
    let email: string | null = null
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(creator)
      email = authUser?.user?.email ?? null
    } catch {
      email = null
    }
    const isAdminAcct = email ? isAdmin({ email } as any) : false
    const isNonIndividual = profile?.type && profile.type !== 'individual'

    const { count: bidCount } = await supabase
      .from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('bidder', creator)
    const { count: txnFrom } = await supabase
      .from('txns')
      .select('id', { count: 'exact', head: true })
      .eq('from_id', creator)
      .eq('token', 'USD')
    const { count: txnTo } = await supabase
      .from('txns')
      .select('id', { count: 'exact', head: true })
      .eq('to_id', creator)
      .eq('token', 'USD')
    const hasMoney = (bidCount ?? 0) > 0 || (txnFrom ?? 0) > 0 || (txnTo ?? 0) > 0

    const protectedAcct = isAdminAcct || isNonIndividual || hasMoney
    const allSpam = g.legit.length === 0

    if (allSpam && !protectedAcct) {
      plans.push({
        creator,
        action: 'ban',
        spamProjectIds: g.spam,
        reason: 'all projects are spam',
      })
    } else if (allSpam && protectedAcct) {
      plans.push({
        creator,
        action: 'review',
        spamProjectIds: g.spam,
        reason: `all-spam but protected (${isAdminAcct ? 'admin ' : ''}${isNonIndividual ? 'non-individual ' : ''}${hasMoney ? 'has-money' : ''}); hiding, not banning`,
      })
    } else {
      plans.push({
        creator,
        action: 'hide',
        spamProjectIds: g.spam,
        reason: `${g.legit.length} legit project(s) too; hiding spam only`,
      })
    }
  }
  return plans
}

function printPlan(plans: CreatorPlan[], cache: Record<string, CachedVerdict>) {
  const bans = plans.filter((p) => p.action === 'ban')
  const hides = plans.filter((p) => p.action === 'hide')
  const reviews = plans.filter((p) => p.action === 'review')
  const hiddenTotal = plans.reduce((n, p) => n + p.spamProjectIds.length, 0)
  console.log(`\n=== PLAN (${APPLY ? 'APPLY' : 'DRY RUN'}) ===`)
  console.log(`  BAN accounts (all projects spam): ${bans.length}`)
  console.log(`  HIDE-only (mixed accounts): ${hides.length} accounts`)
  console.log(`  REVIEW (protected all-spam, hide + flag): ${reviews.length}`)
  console.log(`  spam projects total to hide/remove: ${hiddenTotal}`)
  for (const label of ['ban', 'review', 'hide'] as const) {
    const group = plans.filter((p) => p.action === label)
    if (!group.length) continue
    console.log(`\n--- ${label.toUpperCase()} ---`)
    for (const p of group.slice(0, label === 'hide' ? 15 : 1000)) {
      const first = cache[p.spamProjectIds[0]]
      console.log(
        `  ${p.creator.slice(0, 8)} | ${p.spamProjectIds.length} spam proj | ${p.reason} | e.g. "${(first?.title ?? '').slice(0, 45)}"`
      )
    }
    if (label === 'hide' && group.length > 15) console.log(`  ... and ${group.length - 15} more`)
  }
}

async function emailCreator(
  supabase: ReturnType<typeof createAdminClient>,
  creator: string,
  spamProjectIds: string[],
  banned: boolean
) {
  const email = await getUserEmail(supabase, creator)
  if (!email) return
  const { data: projects } = await supabase
    .from('projects')
    .select('title, blurb, description')
    .in('id', spamProjectIds)
  const proposals = (projects ?? [])
    .map((p) =>
      [p.title, p.blurb ?? '', p.description ? toMarkdown(p.description as any) : '']
        .filter(Boolean)
        .join('\n')
    )
    .join('\n\n---\n\n')
    .slice(0, 5000)
  const action = banned
    ? 'automatically flagged as spam, and your account has been removed'
    : 'automatically flagged as spam and hidden from the site'
  await sendTemplateEmail(
    TEMPLATE_IDS.GENERIC_NOTIF,
    {
      notifText: `Your Manifund ${spamProjectIds.length > 1 ? 'projects were' : 'project was'} ${action}. If you believe this was a mistake, reply to this email and we'll take a look.\n\nFor your reference, here is what you submitted:\n\n${proposals}`,
      buttonUrl: getURL(),
      buttonText: 'Go to Manifund',
      subject: 'Your Manifund project was flagged by our spam filter',
    },
    undefined,
    email
  )
}

async function apply(supabase: ReturnType<typeof createAdminClient>, plans: CreatorPlan[]) {
  const acted = loadJson<Record<string, string>>(ACTIONS, {})
  for (const p of plans) {
    if (acted[p.creator]) {
      console.log(`  skip ${p.creator.slice(0, 8)} (already ${acted[p.creator]})`)
      continue
    }
    try {
      // Email first — banning deletes the account.
      await emailCreator(supabase, p.creator, p.spamProjectIds, p.action === 'ban')
      if (p.action === 'ban') {
        await superbanUser(supabase, p.creator)
      } else {
        await supabase.from('projects').update({ stage: 'hidden' }).in('id', p.spamProjectIds)
      }
      acted[p.creator] = p.action
      fs.writeFileSync(ACTIONS, JSON.stringify(acted, null, 2))
      console.log(`  ${p.action} ${p.creator.slice(0, 8)} (${p.spamProjectIds.length} projects)`)
    } catch (e) {
      console.error(`  FAILED ${p.action} ${p.creator.slice(0, 8)}:`, e)
    }
  }
}

async function main() {
  const supabase = createAdminClient()
  const cache = await classifyAll(supabase)
  if (CLASSIFY_ONLY) return
  const plans = await buildPlan(supabase, cache)
  printPlan(plans, cache)
  if (APPLY) {
    console.log(`\nApplying...`)
    await apply(supabase, plans)
    console.log('Done.')
  } else {
    console.log(`\nDry run only. Re-run with --apply to execute.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
