import { Profile } from '@/db/profile'
import { TOTAL_SHARES } from '@/db/project'
import { TxnAndProfiles } from '@/db/txn'
import { formatLargeNumber } from '@/utils/formatting'
import { Avatar } from '@/components/avatar'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { formatDistanceToNow } from 'date-fns'

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
      <Row key={trade.bundle} className="justify-center">
        <Row className="w-full max-w-sm justify-between gap-5 rounded p-3 hover:bg-gray-200 sm:max-w-xl">
          <Row className="gap-3">
            <Avatar profile={trade.fromProfile} size={6} />
            <Col className="justify-center">
              <ArrowRightIcon className="h-4 w-4" />
            </Col>
            <Avatar profile={trade.toProfile} size={6} />
          </Row>
          <div>
            {formatLargeNumber((trade.numShares / TOTAL_SHARES) * 100)}%{' '}
            <span className="text-gray-500">ownership for</span> $
            {trade.amountUSD}
          </div>
          <div className="hidden text-gray-500 sm:block">
            {formatDistanceToNow(trade.date, {
              addSuffix: true,
            })}
          </div>
        </Row>
      </Row>
    )
  })
  return <div>{tradeDisplay}</div>
}

function genTrades(txns: TxnAndProfiles[]) {
  const tradeTxns = txns.filter((txn) => txn.bundle !== null)
  console.log('tradeTxns', tradeTxns)
  const trades = Object.fromEntries(
    tradeTxns.map((txn) => [txn.bundle, {} as Trade])
  )
  console.log('trades', trades)
  for (const txn of tradeTxns) {
    if (txn.token === 'USD') {
      trades[txn?.bundle ?? 0].amountUSD = txn.amount
      trades[txn?.bundle ?? 0].date = new Date(txn.created_at)
      trades[txn?.bundle ?? 0].fromProfile = txn.profiles
      trades[txn?.bundle ?? 0].bundle = txn.bundle
    } else {
      trades[txn?.bundle ?? 0].numShares = txn.amount
      trades[txn?.bundle ?? 0].toProfile = txn.profiles
    }
  }
  console.log('trades 2', trades)
  console.log('trades values', Object.values(trades))
  return Object.values(trades) as Trade[]
}
