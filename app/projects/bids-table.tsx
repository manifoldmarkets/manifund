import { createClient } from '@/db/supabase-server'
import { Database } from '@/db/database.types'
import { formatMoney } from '@/db/project'
import { Subtitle } from '@/components/subtitle'
import { Table } from '@/components/table'

type Bid = Database['public']['Tables']['bids']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type BidAndProfile = Bid & { profiles: Profile }

export async function BidsTable(props: { projectId: string }) {
  const { projectId } = props
  const supabase = createClient()

  const { data, error } = await supabase
    .from('bids')
    .select('*, profiles(*)')
    .eq('project', projectId)
  if (error) {
    console.error('BidsTable', error)
  }
  const bids = data as BidAndProfile[]

  const buyBids = bids.filter((bid) => bid.type === 'buy')
  const sellBids = bids.filter((bid) => bid.type === 'sell')

  return (
    <div className="flex flex-row gap-4">
      <div>
        <Subtitle>Buy offers</Subtitle>
        <BidsSubtable bids={buyBids} />
      </div>
      <div>
        <Subtitle>Sell offers</Subtitle>
        <BidsSubtable bids={sellBids} />
      </div>
    </div>
  )
}

function BidsSubtable(props: { bids: BidAndProfile[] }) {
  const { bids } = props

  return (
    <Table className="table-auto">
      <thead>
        <tr>
          <th>User</th>
          <th>Valuation</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {bids.map((bid) => (
          <BidRow key={bid.id} bid={bid} />
        ))}
      </tbody>
    </Table>
  )
}

function BidRow(props: { bid: BidAndProfile }) {
  const { bid } = props

  return (
    <tr>
      <td>{bid.profiles.username}</td>
      <td>{formatMoney(bid.valuation)}</td>
      <td>{formatMoney(bid.amount)}</td>
    </tr>
  )
}
