import { Profile } from '@/db/profile'
import { TOTAL_SHARES } from '@/db/project'
import { TxnAndProfiles } from '@/db/txn'
import { formatLargeNumber } from '@/utils/formatting'

type Trade = {
  bundle: string
  toProfile: Profile
  fromProfile: Profile
  amountUSD: number
  numShares: number
  date: Date
}
export function History(props: { txns: TxnAndProfiles[] }) {
  const { txns } = props
  const trades: Trade[] = genTrades(txns)
  const tradeDisplay = trades.map((trade) => {
    return (
      <div key={trade.bundle}>
        <p>
          {trade.toProfile.username} bought{' '}
          {formatLargeNumber((trade.numShares / TOTAL_SHARES) * 100)}% from{' '}
          {trade.fromProfile.username} for ${trade.amountUSD}
        </p>
      </div>
    )
  })
  return <div>{tradeDisplay}</div>
}

function genTrades(txns: TxnAndProfiles[]) {
  const tradeTxns = txns.filter((txn) => txn.bundle !== null)
  const trades = Object.fromEntries(
    tradeTxns.map((txn) => [txn.bundle, {} as Trade])
  )
  for (let i = 0; i < tradeTxns.length; i++) {
    if (tradeTxns[i].token === 'USD') {
      trades[tradeTxns[i].bundle].amountUSD = txns[i].amount
      trades[tradeTxns[i].bundle].date = txns[i].created_at
      trades[tradeTxns[i].bundle].toProfile = txns[i].profiles
      trades[tradeTxns[i].bundle].bundle = tradeTxns[i].bundle
    } else {
      trades[tradeTxns[i].bundle].numShares = txns[i].amount
      trades[tradeTxns[i].bundle].fromProfile = txns[i].profiles
    }
  }
  return trades.values
}
