import { createAdminClient } from '@/db/edge'

// "Withdrawable balance" = calculateCashBalance (utils/math.ts): sum of
// txn.amount * getTxnCashMultiplier(...) plus pending-bid locks. This distinguishes
// withdrawable cash from charity-only funds (unaccredited deposits, cash->charity, etc).
// "Aged N months" = the running withdrawable balance never dropped below that amount at
// any point in the trailing N months, i.e. min(balance over window) is the portion that
// has been sitting untouched for the whole window.
//
// Usage: bun run scripts/idle-cash-balances.ts [months] [threshold]

const MONTHS = Number(process.argv[2] ?? 6)
const THRESHOLD = Number(process.argv[3] ?? 10_000)
const NOW = new Date('2026-07-31T00:00:00.000Z')
const WINDOW_START = new Date(
  Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - MONTHS, NOW.getUTCDate())
).toISOString()
const IGNORE_ACCREDITATION_DATE = new Date('2023-11-02')
const CHARITABLE_DEPOSITS = new Set([
  '1e17c09d-aa7f-432a-b523-89691531b304',
  'c223e240-598f-41a9-8aa0-7a961d8db258',
])

type Txn = {
  id: string
  amount: number
  created_at: string
  from_id: string | null
  to_id: string
  token: string
  type: string | null
  project: string | null
}

// Faithful port of getTxnCashMultiplier (utils/math.ts:270-311).
function getTxnCashMultiplier(
  txn: Txn,
  userId: string,
  projectCreator: string | null,
  accredited: boolean
) {
  if (
    txn.token !== 'USD' ||
    (txn.from_id !== userId && txn.to_id !== userId) ||
    txn.type === 'profile donation' ||
    txn.type === 'tip' ||
    txn.type === 'return bank funds'
  ) {
    return 0
  }
  const isIncoming = txn.to_id === userId
  const isOwnProject = projectCreator === userId
  const actuallyAccredited =
    new Date(txn.created_at) < IGNORE_ACCREDITATION_DATE && accredited
  if (txn.type === 'cash to charity transfer') return -1
  if (isIncoming && txn.from_id === userId) return isOwnProject ? 1 : 0
  if (txn.type === 'project donation') return isIncoming ? 1 : 0
  if (txn.type === 'user to amm trade' || txn.type === 'user to user trade') {
    if (isOwnProject || actuallyAccredited) return isIncoming ? 1 : -1
    return 0
  }
  if (txn.type === 'inject amm liquidity') return isOwnProject ? (isIncoming ? 1 : -1) : 0
  if (txn.type === 'deposit')
    return actuallyAccredited && !CHARITABLE_DEPOSITS.has(txn.id) ? 1 : 0
  if (txn.type === 'withdraw') return -1
  return 0
}

async function pageAll<T>(query: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = []
  const PAGE = 1000
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await query(offset, offset + PAGE - 1).throwOnError()
    out.push(...((data ?? []) as T[]))
    if (!data || data.length < PAGE) break
  }
  return out
}

async function main() {
  const supabase = createAdminClient()

  // Project -> creator (for isOwnProject).
  const projects = await pageAll<{ id: string; creator: string }>((f, t) =>
    supabase.from('projects').select('id, creator').range(f, t)
  )
  const creatorByProject = new Map(projects.map((p) => [p.id, p.creator]))
  console.log(`Fetched ${projects.length} projects`)

  // All USD txns.
  const txns = await pageAll<Txn>((f, t) =>
    supabase
      .from('txns')
      .select('id, amount, created_at, from_id, to_id, token, type, project')
      .eq('token', 'USD')
      .order('created_at', { ascending: true })
      .range(f, t)
  )
  console.log(`Fetched ${txns.length} USD txns`)

  // Accreditation status for every user who appears in a txn.
  const userIds = new Set<string>()
  for (const t of txns) {
    if (t.to_id) userIds.add(t.to_id)
    if (t.from_id) userIds.add(t.from_id)
  }
  const accreditedById = new Map<string, boolean>()
  const idList = Array.from(userIds)
  for (let i = 0; i < idList.length; i += 500) {
    const { data } = await supabase
      .from('profiles')
      .select('id, accreditation_status')
      .in('id', idList.slice(i, i + 500))
      .throwOnError()
    for (const p of data ?? []) accreditedById.set(p.id, !!p.accreditation_status)
  }

  // Pending bids -> per-user withdrawable lock (getBidCashMultiplier: -1 for a
  // pending buy/donate bid on the bidder's OWN non-hidden project).
  const bids = await pageAll<{
    amount: number
    status: string
    type: string
    bidder: string
    projects: { creator: string; stage: string } | null
  }>((f, t) =>
    supabase
      .from('bids')
      .select('amount, status, type, bidder, projects(creator, stage)')
      .eq('status', 'pending')
      .range(f, t)
  )
  const bidLockByUser = new Map<string, number>()
  for (const b of bids) {
    if (!b.projects) continue
    const projectIsBidders = b.projects.creator === b.bidder
    if (
      b.type === 'sell' ||
      b.type === 'assurance sell' ||
      b.projects.stage === 'hidden' ||
      !projectIsBidders
    )
      continue
    bidLockByUser.set(b.bidder, (bidLockByUser.get(b.bidder) ?? 0) - b.amount)
  }

  // Per-user signed withdrawable deltas, chronological.
  const deltasByUser = new Map<string, { created_at: string; delta: number }[]>()
  const push = (userId: string, created_at: string, delta: number) => {
    if (delta === 0) return
    if (!deltasByUser.has(userId)) deltasByUser.set(userId, [])
    deltasByUser.get(userId)!.push({ created_at, delta })
  }
  for (const t of txns) {
    const creator = t.project ? creatorByProject.get(t.project) ?? null : null
    for (const uid of new Set([t.to_id, t.from_id].filter(Boolean) as string[])) {
      const m = getTxnCashMultiplier(t, uid, creator, accreditedById.get(uid) ?? false)
      if (m !== 0) push(uid, t.created_at, t.amount * m)
    }
  }

  const qualifying: { userId: string; current: number; aged: number }[] = []
  for (const [userId, deltas] of deltasByUser) {
    deltas.sort((a, b) => a.created_at.localeCompare(b.created_at))
    let bal = 0
    let i = 0
    for (; i < deltas.length && deltas[i].created_at < WINDOW_START; i++) bal += deltas[i].delta
    let aged = bal
    for (; i < deltas.length; i++) {
      bal += deltas[i].delta
      if (bal < aged) aged = bal
    }
    // Current withdrawable includes pending-bid locks (matches calculateCashBalance).
    const current = bal + (bidLockByUser.get(userId) ?? 0)
    // Pending-bid locks eat into the aged portion too.
    aged = Math.min(aged, current)
    if (aged >= THRESHOLD) {
      qualifying.push({ userId, current, aged })
    }
  }

  qualifying.sort((a, b) => b.aged - a.aged)

  const nameById = new Map<string, { full_name: string; username: string }>()
  const qIds = qualifying.map((q) => q.userId)
  for (let i = 0; i < qIds.length; i += 500) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', qIds.slice(i, i + 500))
      .throwOnError()
    for (const p of data ?? []) nameById.set(p.id, p as any)
  }

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  console.log(
    `\n${qualifying.length} people held >= $${THRESHOLD.toLocaleString()} withdrawable continuously since ${WINDOW_START.slice(0, 10)} (${MONTHS} months):\n`
  )
  console.log(
    'Name'.padEnd(30),
    `Aged ${MONTHS}mo`.padStart(15),
    'Current'.padStart(16),
    '  @username'
  )
  console.log('-'.repeat(82))
  for (const q of qualifying) {
    const p = nameById.get(q.userId)
    console.log(
      (p?.full_name ?? 'Unknown').slice(0, 29).padEnd(30),
      fmt(q.aged).padStart(15),
      fmt(q.current).padStart(16),
      '  @' + (p?.username ?? q.userId)
    )
  }
  const totalAged = qualifying.reduce((s, q) => s + q.aged, 0)
  console.log('-'.repeat(82))
  console.log(`Total aged >= ${MONTHS}mo across these ${qualifying.length} people: ${fmt(totalAged)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
