import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge, UserLink } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { TOTAL_SHARES } from '@/db/project'
import {
  formatMoneyPrecise,
  formatPercent,
  showPrecision,
} from '@/utils/formatting'
import clsx from 'clsx'
import { orderBy } from 'lodash'
import { formatDistanceToNow } from 'date-fns'
import { bundleTxns } from '@/utils/math'
import { Shareholder } from './project-tabs'
import { TxnAndProfiles } from '@/db/txn'
import { calculateAMMPorfolio } from '@/utils/amm'

export function Shareholders(props: {
  shareholders: Shareholder[]
  creator: Profile
  txns: TxnAndProfiles[]
  projectId: string
}) {
  const { shareholders, creator, txns, projectId } = props
  const nonAmmShareholders = shareholders.filter(
    (shareholder) => shareholder.profile.type !== 'amm'
  )
  const ammTxns = txns.filter(
    (txn) => txn.from_id === projectId || txn.to_id === projectId
  )
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, projectId)
  const sortedShareholders = orderBy(nonAmmShareholders, 'numShares', 'desc')
  return (
    <Row className="w-full justify-center">
      <Col className="w-full max-w-sm sm:max-w-xl">
        {sortedShareholders.map((shareholder) => (
          <Row
            key={shareholder.profile?.id}
            className={clsx(
              'justify-between rounded p-3 hover:bg-gray-200',
              shareholder.profile?.id === creator.id &&
                'bg-orange-100 hover:bg-orange-200'
            )}
          >
            <UserAvatarAndBadge profile={shareholder.profile} />{' '}
            {showPrecision((shareholder.numShares / TOTAL_SHARES) * 100, 4)}%
          </Row>
        ))}
        <span className="my-5 text-sm text-gray-500">
          The automated market maker currently holds{' '}
          {formatPercent(ammShares / TOTAL_SHARES)} equity and{' '}
          {formatMoneyPrecise(ammUSD)}. Those assets will be returned to the
          founder when the project closes.
        </span>
        <TradeHistory txns={txns} creatorId={creator.id} />
      </Col>
    </Row>
  )
}

function Trade(props: {
  trader: Profile
  isCreator: boolean
  amountUSD: number
  equityPortion: number
  createdAt: string
  isBuying: boolean
}) {
  const { trader, isCreator, amountUSD, equityPortion, createdAt, isBuying } =
    props
  return (
    <Row className="justify-center">
      <div className="grid w-full max-w-sm grid-cols-2 justify-between gap-3 rounded p-3 text-sm hover:bg-gray-200 sm:max-w-xl sm:grid-cols-3">
        <UserAvatarAndBadge profile={trader} creatorBadge={isCreator} />
        <Row className="justify-end gap-1">
          <span className="text-gray-500">{isBuying ? 'bought' : 'sold'}</span>
          {formatPercent(equityPortion)}
          <span className="text-gray-500">for</span>
          {formatMoneyPrecise(amountUSD)}
        </Row>
        <span className="hidden text-right text-gray-500 sm:block">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
    </Row>
  )
}

function TradeHistory(props: { txns: TxnAndProfiles[]; creatorId: string }) {
  const { txns, creatorId } = props
  const tradeTxns = txns.filter(
    (txn) =>
      txn.type === 'user to user trade' || txn.type === 'user to amm trade'
  )
  const bundledTxns = bundleTxns(tradeTxns)
  const tradeDisplay = bundledTxns.flatMap((bundle) => {
    const usdTxn = bundle.find((txn) => txn.token === 'USD')
    const sharesTxn = bundle.find((txn) => txn.token !== 'USD')
    const amountUSD = usdTxn?.amount ?? 0
    const numShares = sharesTxn?.amount ?? 1
    const equityPortion = numShares / TOTAL_SHARES
    if (bundle[0].type === 'user to user trade') {
      return bundle.map((txn) => (
        <Trade
          key={txn.id}
          trader={txn.profiles as Profile}
          equityPortion={equityPortion}
          createdAt={txn.created_at}
          amountUSD={amountUSD}
          isCreator={txn.from_id === creatorId}
          isBuying={txn.token === 'USD'}
        />
      ))
    } else {
      const realTrader = bundle.find((txn) => txn.from_id !== txn.project)
        ?.profiles as Profile
      return (
        <Trade
          key={bundle[0].id}
          trader={realTrader}
          equityPortion={equityPortion}
          createdAt={bundle[0].created_at}
          amountUSD={amountUSD}
          isCreator={realTrader.id === creatorId}
          isBuying={usdTxn?.from_id === realTrader.id}
        />
      )
    }
  })
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-2 text-gray-500">Trade history</span>
        </div>
      </div>
      <div className="h-4" />
      {tradeDisplay}
    </div>
  )
}
