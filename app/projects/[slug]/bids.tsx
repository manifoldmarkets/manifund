'use client'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile, updateBidOnTrade } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'
import { useSupabase } from '@/db/supabase-provider'
import { formatMoney } from '@/utils/formatting'

export function Bids(props: {
  bids: BidAndProfile[]
  stage: string
  userId?: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const { bids, stage, userId, userSpendableFunds, userSellableShares } = props

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
            <Bid key={bid.id} bid={bid} showValuation={false} />
          ))}
        </Col>
      </Row>
    )
  } else if (stage === 'active') {
    const buyBids = bids.filter((bid) => bid.type === 'buy')
    const sellBids = bids.filter((bid) => bid.type === 'sell')
    return (
      <Row className="w-full justify-center">
        <div className="flex w-full flex-col">
          <Col>
            {buyBids.length !== 0 && <h1 className="text-xl">Buy Offers</h1>}
            {buyBids.map((bid) => (
              <Bid
                key={bid.id}
                bid={bid}
                userId={userId}
                showValuation={true}
                userSellableShares={userSellableShares}
              />
            ))}
          </Col>
          <Col>
            {sellBids.length !== 0 && <h1 className="text-xl">Sell Offers</h1>}
            {sellBids.map((bid) => (
              <Bid
                key={bid.id}
                bid={bid}
                userId={userId}
                showValuation={true}
                userSpendableFunds={userSpendableFunds}
              />
            ))}
          </Col>
        </div>
      </Row>
    )
  } else {
    return <></>
  }
}

function Bid(props: {
  bid: BidAndProfile
  showValuation: boolean
  userId?: string
  userSpendableFunds?: number
  userSellableShares?: number
}) {
  const { bid, showValuation, userId, userSpendableFunds, userSellableShares } =
    props
  const enoughMoney = bid.amount <= (userSpendableFunds ?? 0)
  const enoughShares =
    (bid.amount / bid.valuation) * TOTAL_SHARES <= (userSellableShares ?? 0)
  const { supabase } = useSupabase()
  return (
    <Row className="w-full justify-between gap-3 rounded p-3 hover:bg-gray-200">
      <UserAvatarAndBadge profile={bid.profiles} />
      {showValuation ? (
        <div className="relative top-1.5">
          {formatMoney(bid.amount)} <span className="text-gray-500"> @ </span>$
          {bid.valuation}
          <span className="text-gray-500"> valuation</span>
        </div>
      ) : (
        <div className="relative top-1.5">{formatMoney(bid.amount)}</div>
      )}
      {userId && (
        <Button
          disabled={
            (bid.type === 'buy' ? !enoughShares : !enoughMoney) ||
            bid.bidder === userId
          }
          onClick={async () => {
            await updateBidOnTrade(bid, bid.amount, supabase)
            const response = await fetch('/api/trade', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                buyer: bid.type === 'buy' ? userId : bid.bidder,
                seller: bid.type === 'buy' ? bid.bidder : userId,
                amount: bid.amount,
                valuation: bid.valuation,
                projectId: bid.project,
              }),
            })
          }}
        >
          trade
        </Button>
      )}
    </Row>
  )
}
