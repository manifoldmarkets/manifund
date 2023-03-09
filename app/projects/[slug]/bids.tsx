'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile } from '@/db/bid'

export function Bids(props: { bids: BidAndProfile[]; stage: string }) {
  const { bids, stage } = props
  if (bids.length === 0)
    return (
      <p className="text-center italic text-gray-500">
        There are no bids on this project yet.
      </p>
    )
  if (stage === 'proposal') {
    return (
      <Row className="justify-center">
        <Col className="w-full max-w-xl">
          {bids.map((bid) => (
            <Bid key={bid.id} bid={bid} showValuation={true} />
          ))}
        </Col>
      </Row>
    )
  } else if (stage === 'active') {
    const buyBids = bids.filter((bid) => bid.type === 'buy')
    const sellBids = bids.filter((bid) => bid.type === 'sell')
    return (
      <Row className="justify-center">
        <Col className="w-full max-w-xl">
          {buyBids.length !== 0 && <h1 className="text-xl">Buy Offers</h1>}
          {buyBids.map((bid) => (
            <Bid key={bid.id} bid={bid} showValuation={true} />
          ))}
          <div className="h-4" />
          {sellBids.length !== 0 && <h1 className="text-xl">Sell Offers</h1>}
          {sellBids.map((bid) => (
            <Bid key={bid.id} bid={bid} showValuation={true} />
          ))}
        </Col>
      </Row>
    )
  } else {
    return <></>
  }
}

function Bid(props: { bid: BidAndProfile; showValuation: boolean }) {
  const { bid, showValuation } = props
  return (
    <Row className="justify-between rounded p-3 hover:bg-gray-200">
      <UserAvatarAndBadge profile={bid.profiles} />
      {showValuation ? (
        <div>
          ${bid.amount} <span className="text-gray-500"> @ </span>$
          {bid.valuation}
          <span className="text-gray-500"> valuation</span>
        </div>
      ) : (
        <div>${bid.amount}</div>
      )}
    </Row>
  )
}
