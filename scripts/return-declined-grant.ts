import { createAdminClient } from '@/db/edge'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { calculateCashBalance, calculateCharityBalance } from '@/utils/math'

// Returns declined grant funds from a grantee back to a fund account.
//
// Grant money arrives as an incoming 'project donation', which credits the
// grantee's CASH balance and leaves charity balance at 0. There is no single txn
// type that moves cash from one profile to another, so this is two rows:
//   1. 'cash to charity transfer' (self-txn): -1 cash, +1 charity for the grantee
//   2. 'profile donation' to the fund:        -1 charity for grantee, +1 for fund
// Skipping row 1 would move the money while leaving the grantee's withdrawable
// balance intact, letting them withdraw funds they no longer have.
//
// Usage: bun run scripts/return-declined-grant.ts <fromUsername> <toUser>:<amount> [...] [--execute]
//   e.g. ... andrewluskin acx-grants:25000
//        ... StevePetersen Austin:1000 TassiloNeubauer:500 NeelNanda:10500

const argv = process.argv.slice(2).filter((a) => a !== '--execute')
const EXECUTE = process.argv.includes('--execute')
const fromUsername = argv[0]
const recipients = argv.slice(1).map((pair) => {
  const [username, amt] = pair.split(':')
  return { username, amount: Number(amt) }
})

if (
  !fromUsername ||
  !recipients.length ||
  recipients.some((r) => !r.username || !Number.isFinite(r.amount) || r.amount <= 0)
) {
  console.error(
    'Usage: bun run scripts/return-declined-grant.ts <fromUsername> <toUser>:<amount> [...] [--execute]'
  )
  process.exit(1)
}
const amount = recipients.reduce((s, r) => s + r.amount, 0)

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function balances(supabase: any, id: string, accredited: boolean) {
  const txns = await getTxnAndProjectsByUser(supabase, id)
  const bids = await getPendingBidsByUser(supabase, id)
  return {
    cash: calculateCashBalance(txns, bids, id, accredited),
    charity: calculateCharityBalance(txns, bids, id, accredited),
  }
}

async function main() {
  const supabase = createAdminClient()

  const { data: from } = await supabase
    .from('profiles')
    .select('id, username, full_name, accreditation_status')
    .eq('username', fromUsername)
    .single()
    .throwOnError()
  const tos = []
  for (const r of recipients) {
    const { data: to } = await supabase
      .from('profiles')
      .select('id, username, full_name, accreditation_status, type')
      .eq('username', r.username)
      .single()
      .throwOnError()
    tos.push({ ...to, amount: r.amount })
  }

  const before = await balances(supabase, from.id, from.accreditation_status)
  console.log(`From: ${from.full_name} (@${from.username}) ${from.id}`)
  console.log(`  cash ${fmt(before.cash)} | charity ${fmt(before.charity)}`)
  for (const to of tos) {
    console.log(`To:   ${to.full_name} (@${to.username}) ${to.id} [${to.type}] ${fmt(to.amount)}`)
  }
  console.log(`Total: ${fmt(amount)}\n`)

  if (before.cash < amount) {
    console.error(`ABORT: cash balance ${fmt(before.cash)} < ${fmt(amount)}`)
    process.exit(1)
  }

  const rows = [
    {
      from_id: from.id,
      to_id: from.id,
      amount,
      token: 'USD',
      type: 'cash to charity transfer' as const,
      project: null,
    },
    ...tos.map((to) => ({
      from_id: from.id,
      to_id: to.id,
      amount: to.amount,
      token: 'USD',
      type: 'profile donation' as const,
      project: null,
    })),
  ]

  if (!EXECUTE) {
    console.log('DRY RUN — would insert:')
    for (const r of rows) console.log(' ', JSON.stringify(r))
    console.log('\nRe-run with --execute to write.')
    return
  }

  const { data: inserted } = await supabase
    .from('txns')
    .insert(rows)
    .select('id, type')
    .throwOnError()
  console.log('Inserted:')
  for (const r of inserted ?? []) console.log(' ', r.id, r.type)

  const after = await balances(supabase, from.id, from.accreditation_status)
  console.log(
    `\n${from.username}: cash ${fmt(before.cash)} -> ${fmt(after.cash)} | charity ${fmt(
      before.charity
    )} -> ${fmt(after.charity)}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
