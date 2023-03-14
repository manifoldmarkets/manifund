import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { TOTAL_SHARES } from '@/db/project'
import { formatLargeNumber } from '@/utils/formatting'
import clsx from 'clsx'
import { orderBy } from 'lodash'
import { Avatar } from '@/components/avatar'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { Trade } from './tabs'

export function Shareholders(props: { trades: Trade[]; creator: Profile }) {
  const { trades, creator } = props
  const shareholders = calculateShareholders(trades, creator)
  const sortedShareholders = orderBy(shareholders, 'numShares', 'desc')
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
            {formatLargeNumber((shareholder.numShares / TOTAL_SHARES) * 100)}%
          </Row>
        ))}
        <div className="h-8" />
        <History trades={trades} />
      </Col>
    </Row>
  )
}

type Shareholder = {
  profile: Profile
  numShares: number
}
function calculateShareholders(trades: Trade[], creator: Profile) {
  const shareholders = Object.fromEntries(
    trades.map((trade) => [trade.toProfile.id, { numShares: 0 } as Shareholder])
  )
  shareholders[creator.id] = { profile: creator, numShares: 10000000 }
  for (const trade of trades) {
    shareholders[trade.toProfile.id].profile = trade.toProfile
    shareholders[trade.toProfile.id].numShares += trade.numShares
    shareholders[trade.fromProfile.id].numShares -= trade.numShares
  }
  return Object.values(shareholders) as Shareholder[]
}

function History(props: { trades: Trade[] }) {
  const { trades } = props
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
