import { createServerSupabaseClient } from '@/db/supabase-server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { BidAndProject } from '@/db/bid'
import { TxnAndProject } from '@/db/txn'
import { calculateCashBalance, calculateCharityBalance, calculateUserBalance } from '@/utils/math'

const LIMIT = 100
// PostgREST caps a single response at 1000 rows, so bulk fetches page past it.
const PAGE = 1000

// Public profile fields only — no email, accreditation status, or payout account ids.
// accreditation_status is selected because the balance math needs it, then stripped.
const PROFILE_SELECT = `
  id,
  created_at,
  username,
  full_name,
  bio,
  website,
  avatar_url,
  type,
  regranter_status,
  accreditation_status
`

type ProfileRow = {
  id: string
  created_at: string
  accreditation_status: boolean
  [key: string]: unknown
}

// Treat filter values as literal strings: % and _ are wildcards to LIKE.
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

async function listProfilesPaginated(
  supabase: SupabaseClient,
  filters: {
    before?: string | null
    id?: string | null
    username?: string | null
    name?: string | null
  }
) {
  let query = supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .order('created_at', { ascending: false })
    .limit(LIMIT)

  if (filters.before) {
    const timestamp = new Date(filters.before).toISOString()
    query = query.filter('created_at', 'lt', timestamp)
  }
  // id is a uuid, which has no ilike operator — id_text is a computed field casting it to text.
  if (filters.id) query = query.ilike('id_text', `%${escapeLike(filters.id)}%`)
  if (filters.username) query = query.ilike('username', `%${escapeLike(filters.username)}%`)
  if (filters.name) query = query.ilike('full_name', `%${escapeLike(filters.name)}%`)

  const { data } = await query.throwOnError()
  return (data ?? []) as ProfileRow[]
}

// Every txn touching any of these profiles, on either side of the transfer.
async function listTxnsForProfiles(supabase: SupabaseClient, profileIds: string[]) {
  const txnsById = new Map<string, TxnAndProject>()
  for (const column of ['from_id', 'to_id']) {
    for (let start = 0; ; start += PAGE) {
      const { data } = await supabase
        .from('txns')
        .select('*, projects(creator, stage, type)')
        .in(column, profileIds)
        .range(start, start + PAGE - 1)
        .throwOnError()
      const txns = (data ?? []) as TxnAndProject[]
      txns.forEach((txn) => txnsById.set(txn.id, txn))
      if (txns.length < PAGE) break
    }
  }
  return [...txnsById.values()]
}

// Pending bids lock funds, so balances need them to match what profile pages show.
async function listPendingBidsForProfiles(supabase: SupabaseClient, profileIds: string[]) {
  const bids: BidAndProject[] = []
  for (let start = 0; ; start += PAGE) {
    const { data } = await supabase
      .from('bids')
      .select('*, projects(creator, stage, type)')
      .in('bidder', profileIds)
      .eq('status', 'pending')
      .range(start, start + PAGE - 1)
      .throwOnError()
    const page = (data ?? []) as BidAndProject[]
    bids.push(...page)
    if (page.length < PAGE) break
  }
  return bids
}

function groupBy<T>(items: T[], keys: (item: T) => (string | null)[], allowed: Set<string>) {
  const grouped = new Map<string, T[]>()
  items.forEach((item) => {
    keys(item).forEach((key) => {
      if (!key || !allowed.has(key)) return
      const existing = grouped.get(key)
      if (existing) existing.push(item)
      else grouped.set(key, [item])
    })
  })
  return grouped
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const profiles = await listProfilesPaginated(supabase, {
    before: searchParams.get('before'),
    id: searchParams.get('id'),
    username: searchParams.get('username'),
    name: searchParams.get('name'),
  })
  if (profiles.length === 0) {
    return NextResponse.json([])
  }

  const profileIds = profiles.map((profile) => profile.id)
  const idSet = new Set(profileIds)
  const [allTxns, allBids] = await Promise.all([
    listTxnsForProfiles(supabase, profileIds),
    listPendingBidsForProfiles(supabase, profileIds),
  ])
  const txnsByProfile = groupBy(allTxns, (txn) => [txn.from_id, txn.to_id], idSet)
  const bidsByProfile = groupBy(allBids, (bid) => [bid.bidder], idSet)

  const users = profiles.map((profile) => {
    const { accreditation_status, ...publicProfile } = profile
    const txns = txnsByProfile.get(profile.id) ?? []
    const bids = bidsByProfile.get(profile.id) ?? []
    return {
      ...publicProfile,
      created_at: new Date(profile.created_at).toISOString(),
      // Cash and charity exclude funds locked in pending bids, so they can sum to
      // less than the total balance — same as what the site shows on a profile.
      cash_balance: calculateCashBalance(txns, bids, profile.id, accreditation_status),
      charity_balance: calculateCharityBalance(txns, bids, profile.id, accreditation_status),
      total_balance: calculateUserBalance(txns, profile.id),
      txns: txns
        .filter((txn) => txn.token === 'USD')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((txn) => ({
          id: txn.id,
          created_at: new Date(txn.created_at).toISOString(),
          amount: txn.amount,
          type: txn.type,
          from_id: txn.from_id,
          to_id: txn.to_id,
          project: txn.project,
        })),
    }
  })

  return NextResponse.json(users)
}
