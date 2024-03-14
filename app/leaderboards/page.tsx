import { Avatar } from '@/components/avatar'
import { UserLink } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'

function AvatarAndLink(props: { profile: Profile }) {
  const { profile } = props
  return (
    <div className="flex flex-row items-center gap-4">
      <Avatar
        username={profile.username}
        size={6}
        avatarUrl={profile.avatar_url}
        id={profile.id}
      />
      <UserLink
        name={profile.full_name || profile.username}
        username={profile.username}
      />
    </div>
  )
}

export default async function Leaderboard() {
  const supabase = createServerClient()
  const { data: users } = await supabase.from('users').select('*')
  const { data: profiles } = await supabase.from('profiles').select('*')
  const { data: txns } = await supabase
    .from('txns')
    .select('*')
    .eq('token', 'USD')
    .order('created_at', { ascending: false })

  // Show a table listing all txns, as well as the user that made that txn
  // const balances = userBalances(txns ?? [])
  const usersById = new Map(users?.map((user) => [user.id, user]) ?? [])
  const profilesById = new Map(
    profiles?.map((profile) => [profile.id, profile]) ?? []
  )

  // Create on JSON object mapping toId -> total received (sum of txn amounts)
  const receivedByToId = {} as Record<string, number>
  txns
    ?.filter((txn) => txn.type === 'deposit')
    .forEach((txn) => {
      receivedByToId[txn.to_id] = (receivedByToId[txn.to_id] ?? 0) + txn.amount
    })

  return (
    <div className="p-4">
      <h1 className="py-4 text-3xl font-bold">Total donated</h1>
      <p className="text-sm font-light text-gray-600">
        Excludes regrantors and some large donations
      </p>
      <table className="mt-4 table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Donated</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(receivedByToId)
            .sort((a, b) => b[1] - a[1])
            .map(([toId, amount]) => {
              const profile = profilesById.get(toId)
              // Skip regrantors
              if (!profile || profile.regranter_status) return null
              return (
                <tr key={toId}>
                  <td className="border px-4 py-2">
                    <AvatarAndLink profile={profile} />
                  </td>
                  <td className="border px-4 py-2">${amount}</td>
                </tr>
              )
            })}
        </tbody>
      </table>

      <h1 className="py-4 text-3xl font-bold">All deposits</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {txns
            ?.filter((txn) => txn.type === 'deposit')
            .map((txn) => {
              const toProfile = profilesById.get(txn.to_id)
              return (
                <tr key={txn.id}>
                  <td className="border px-4 py-2">{txn.created_at}</td>
                  <td className="border px-4 py-2">${txn.amount}</td>
                  <td className="border px-4 py-2">
                    {toProfile && <AvatarAndLink profile={toProfile} />}
                  </td>
                  <td className="border px-4 py-2">{txn.type}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
