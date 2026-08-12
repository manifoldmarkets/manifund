import { createAdminClient } from '@/db/edge'
import { computeIdleBalances } from '@/utils/idle-balances'

// Prints holders of long-idle withdrawable balances. Computation lives in
// utils/idle-balances.ts (shared with the quarterly /api/email-idle-balances cron).
//
// Usage: bun run scripts/idle-cash-balances.ts [months] [threshold] [as-of-date]
//   e.g. bun run scripts/idle-cash-balances.ts 12 10000 2026-07-31

const MONTHS = Number(process.argv[2] ?? 6)
const THRESHOLD = Number(process.argv[3] ?? 10_000)
const NOW = process.argv[4] ? new Date(`${process.argv[4]}T00:00:00.000Z`) : new Date()

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function main() {
  const supabase = createAdminClient()
  const qualifying = await computeIdleBalances(supabase, MONTHS, THRESHOLD, NOW)

  const windowStart = new Date(
    Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - MONTHS, NOW.getUTCDate())
  )
  console.log(
    `\n${qualifying.length} people held >= $${THRESHOLD.toLocaleString()} withdrawable continuously since ${windowStart
      .toISOString()
      .slice(0, 10)} (${MONTHS} months):\n`
  )
  console.log(
    'Name'.padEnd(30),
    `Aged ${MONTHS}mo`.padStart(15),
    'Current'.padStart(16),
    '  @username'
  )
  console.log('-'.repeat(82))
  for (const q of qualifying) {
    console.log(
      q.full_name.slice(0, 29).padEnd(30),
      fmt(q.aged).padStart(15),
      fmt(q.current).padStart(16),
      '  @' + q.username
    )
  }
  const totalAged = qualifying.reduce((s, q) => s + q.aged, 0)
  console.log('-'.repeat(82))
  console.log(
    `Total aged >= ${MONTHS}mo across these ${qualifying.length} people: ${fmt(totalAged)}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
