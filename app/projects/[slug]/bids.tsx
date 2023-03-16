'use client'
import { Button } from '@/components/button'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { Fragment, useRef, useState } from 'react'

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
        There are no bids on this project.
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
                userSpendableFunds={userSpendableFunds}
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
                userSellableShares={userSellableShares}
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
  console.log(userId, userSpendableFunds, userSellableShares)
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
      {userId &&
        userSpendableFunds !== undefined &&
        userSellableShares !== undefined && (
          <Trade
            bid={bid}
            userId={userId}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
          />
        )}
    </Row>
  )
}

function Trade(props: {
  bid: BidAndProfile
  userId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const { bid, userId, userSpendableFunds, userSellableShares } = props
  const enoughMoney = bid.amount <= (userSpendableFunds ?? 0)
  const enoughShares =
    (bid.amount / bid.valuation) * TOTAL_SHARES <= (userSellableShares ?? 0)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cancelButtonRef = useRef(null)
  const router = useRouter()
  return (
    <div>
      <Button
        disabled={
          (bid.type === 'buy' ? !enoughShares : !enoughMoney) ||
          bid.bidder === userId
        }
        onClick={async () => {
          setOpen(true)
        }}
      >
        trade
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Payment successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Lorem ipsum, dolor sit amet consectetur adipisicing
                          elit. Eius aliquam laudantium explicabo pariatur iste
                          dolorem animi vitae error totam. At sapiente aliquam
                          accusamus facere veritatis.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <Button
                      type="button"
                      className="r inline-flex w-full justify-center sm:col-start-2"
                      loading={isSubmitting}
                      onClick={async () => {
                        const response = await fetch('/api/trade', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            oldBidId: bid.id,
                            usdTraded: bid.amount,
                            tradePartnerId: userId,
                          }),
                        })
                        const res = await response.json()
                        setIsSubmitting(false)
                        router.refresh()
                      }}
                    >
                      Trade
                    </Button>
                    <Button
                      type="button"
                      color={'gray'}
                      className="inline-flex w-full justify-center sm:col-start-1"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
