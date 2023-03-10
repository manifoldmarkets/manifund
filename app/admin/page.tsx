import { Table } from '@/components/table'
import { getUser, isAdmin } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { createAdminClient } from '@/pages/api/_db'
import { PayUser } from './pay-user'
import { VerifyInvestor } from './verify-investor'
import { RoundBidAmounts } from './round-bid-amounts'
import { SupabaseClient } from '@supabase/supabase-js'
import { roundLargeNumber } from '@/utils/formatting'

export default async function Admin() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) {
    return <div>Not authorized</div>
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, profiles(username, accreditation_status)')
  const users = data as {
    id: string
    email: string
    profiles: { username: string; accreditation_status: boolean }
  }[]

  const usersById = new Map(users.map((user) => [user.id, user]))
  const getName = (userId: string | null) => {
    return usersById.get(userId ?? '')?.profiles?.username
  }

  const { data: txns } = await supabaseAdmin
    .from('txns')
    .select('*')
    .eq('token', 'USD')
    .order('created_at')

  return (
    <div>
      <h1>Admin</h1>
      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Id</th>
            <th>Accredited</th>
            <th>Pay user</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.profiles.username}</td>
              <td>{user.id}</td>
              <td>
                <VerifyInvestor
                  userId={user.id}
                  accredited={user.profiles.accreditation_status}
                />
              </td>
              <td>
                <PayUser userId={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2>Transactions</h2>
      <Table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Token</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {(txns ?? []).map((txn) => (
            <tr key={txn.id}>
              <td>{getName(txn.from_id)}</td>
              <td>{getName(txn.to_id)}</td>
              <td>{txn.amount}</td>
              <td>{txn.token}</td>
              <td>{txn.created_at}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2>Round Bid Amounts</h2>
      <RoundBidAmounts />
    </div>
  )
}

async function roundDbBidAmounts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('bids').select('*')
  if (error) {
    console.error('Getting bids', error)
  } else {
    data.forEach(async (bid) => {
      console.log(
        'Updating bid',
        bid.id,
        bid.amount,
        '->',
        roundLargeNumber(bid.amount)
      )
      const { error } = await supabase
        .from('bids')
        .update({ amount: roundLargeNumber(bid.amount) })
        .eq('id', bid.id)
      if (error) {
        console.error('Updating bid', error)
      }
    })
  }
}
