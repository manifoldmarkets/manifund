import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'
import { userBalances } from '../admin/utils'
import UsersGrid from './users-grid'

export default async function FinancesPage() {
  const supabase = await createAuthorizedAdminClient()
  const [{ data: users }, { data: profiles }, { data: txns }] =
    await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('txns').select('*').eq('token', 'USD').order('created_at'),
    ])
  const balances = userBalances(txns ?? [])

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
