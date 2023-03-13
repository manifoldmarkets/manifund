import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { TOTAL_SHARES } from '@/db/project'
import { formatLargeNumber } from '@/utils/formatting'
import { orderBy } from 'lodash'
import { Trade } from './tabs'

export function Shareholders(props: { trades: Trade[]; creator: Profile }) {
  const { trades, creator } = props
  const shareholders = calculateShareholders(trades, creator)
  const sortedShareholders = orderBy(shareholders, 'numShares', 'desc')
  return (
    <Row className="w-full justify-center">
      <Col className="w-full max-w-lg">
        {sortedShareholders.map((shareholder) => (
          <Row
            key={shareholder.profile?.id}
            className="justify-between rounded p-3 hover:bg-gray-200"
          >
            <UserAvatarAndBadge profile={shareholder.profile} />{' '}
            {formatLargeNumber((shareholder.numShares / TOTAL_SHARES) * 100)}%
          </Row>
        ))}
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
  console.log(shareholders)
  return Object.values(shareholders) as Shareholder[]
}
