'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile } from '@/db/bid'

export function Bids(props: { bids: BidAndProfile[] }) {
  const { bids } = props
  return (
    <Row className="justify-center">
      <Col className="w-10/12">
        {bids.map((bid) => (
          <Bid key={bid.id} bid={bid} />
        ))}
      </Col>
    </Row>
  )
}

function Bid(props: { bid: BidAndProfile }) {
  const { bid } = props
  return (
    <Row className="justify-between rounded p-3 hover:bg-gray-200">
      <UserAvatarAndBadge profile={bid.profiles} />
      <div>${bid.amount}</div>
    </Row>
  )
}
