import { createAdminClient } from '@/db/edge'
import { Txn } from '@/db/txn'
import { userBalances } from '../admin/utils'
import UsersGrid from './users-grid'

// Supabase caps a single response at 5000 rows; page through to get all USD txns.
async function fetchAllUSDTxns(supabase: ReturnType<typeof createAdminClient>) {
  const PAGE = 2000
  const all: Txn[] = []
  for (let from = 0; ; from += PAGE) {
    const { data } = await supabase
      .from('txns')
      .select('*')
      .eq('token', 'USD')
      .order('created_at')
      .range(from, from + PAGE - 1)
      .throwOnError()
    if (!data?.length) break
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}

export default async function FinancesPage() {
  const supabase = createAdminClient()
  const [{ data: users }, { data: profiles }, txns] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('profiles').select('*'),
    fetchAllUSDTxns(supabase),
  ])
  const balances = userBalances(txns)

  const userAndProfiles =
    users
      ?.filter((user) => user.id)
      .map((user) => {
        const profile = profiles?.find((p) => p.id === user.id)
        // Note: balances can be undefined if a user has no transactions
        const balance = balances.get(user.id!)
        return {
          id: user.id,
          // (not sending emails to the client)
          username: profile?.username,
          full_name: profile?.full_name,
          balance: balance ?? 0,
        }
      })
      // Sort by balance, highest to lowest
      .sort((a, b) => b.balance - a.balance)
      // Round balances to nearest dollar
      .map((user) => ({
        ...user,
        balance: Math.round(user.balance),
      })) ?? []

  return <UsersGrid users={userAndProfiles} />
}
