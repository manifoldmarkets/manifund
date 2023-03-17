'use client'
import { Button, IconButton } from '@/components/button'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { UserAvatarAndBadge } from '@/components/user-link'
import { BidAndProfile, deleteBid } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import { Dialog, Transition } from '@headlessui/react'
import { CircleStackIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { Fragment, useRef, useState } from 'react'
import { MySlider } from '@/components/slider'
import { Input } from '@/components/input'
import { useSupabase } from '@/db/supabase-provider'

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
        <div>
          {bid.bidder === userId ? (
            <Button
              className=" w-14 bg-rose-500 hover:bg-rose-600"
              onClick={async () => await deleteBid(supabase, bid.id)}
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
          ) : (
            <Trade
              bid={bid}
              userId={userId}
              userSpendableFunds={userSpendableFunds ?? 0}
              userSellableShares={userSellableShares ?? 0}
            />
          )}
        </div>
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
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tradeAmount, setTradeAmount] = useState(bid.amount)
  const enoughMoney = tradeAmount <= (userSpendableFunds ?? 0)
  const enoughShares =
    (tradeAmount / bid.valuation) * TOTAL_SHARES <= (userSellableShares ?? 0)
  const marks = {
    0: '$0',
    25: `${formatMoney(bid.amount / 4)}`,
    50: `${formatMoney(bid.amount / 2)}`,
    75: `${formatMoney((bid.amount / 4) * 3)}`,
    100: `${formatMoney(bid.amount)}`,
  }
  const cancelButtonRef = useRef(null)
  const router = useRouter()

  let errorMessage: string | null = null
  if (bid.type === 'buy' && !enoughShares) {
    errorMessage = `You don't hold enough equity to make this trade. If all of the sell offers you have already placed are accepted, you will only have ${formatLargeNumber(
      userSellableShares / TOTAL_SHARES
    )}% left.`
  } else if (bid.type === 'sell' && !enoughMoney) {
    errorMessage = `You don't have enough funds to make this trade. If all of the buy bids you have already placed are accepted, you will only have ${formatMoney(
      userSpendableFunds
    )} left.`
  } else if (tradeAmount > bid.amount) {
    errorMessage = `You can only trade up to the amount offered: ${formatLargeNumber(
      (tradeAmount / bid.valuation) * 100
    )}% for ${formatMoney(tradeAmount)}.`
  } else if (tradeAmount <= 0) {
    errorMessage = `You must trade over $0.`
  }
  return (
    <div>
      <Button
        className="w-14"
        onClick={async () => {
          setOpen(true)
        }}
      >
        {bid.type === 'buy' ? 'Sell' : 'Buy'}
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
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
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
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <CircleStackIcon
                        className="h-6 w-6 text-orange-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Select trade amount
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Choose what portion of this offer to accept.
                        </p>
                      </div>
                      <div className="mt-5 flex justify-center">
                        <div className="flex w-11/12 justify-center gap-2">
                          <p className="relative top-3">$</p>
                          <Input
                            value={tradeAmount}
                            type="number"
                            className="w-1/3"
                            onChange={(event) =>
                              setTradeAmount(Number(event.target.value))
                            }
                          />
                          <MySlider
                            marks={marks}
                            value={(tradeAmount / bid.amount) * 100}
                            onChange={(value) =>
                              setTradeAmount(
                                ((value as number) * bid.amount) / 100
                              )
                            }
                            step={5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-red-500">{errorMessage}</div>
                  <div className="sm:flex-2 mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
                    <Button
                      type="button"
                      color={'gray'}
                      className="inline-flex w-full justify-center sm:col-start-1"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="sm:flex-2 inline-flex w-full justify-center"
                      loading={isSubmitting}
                      disabled={errorMessage !== null}
                      onClick={async () => {
                        const response = await fetch('/api/trade', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            oldBidId: bid.id,
                            usdTraded: tradeAmount,
                            tradePartnerId: userId,
                          }),
                        })
                        const res = await response.json()
                        setIsSubmitting(false)
                        setOpen(false)
                        router.refresh()
                      }}
                    >
                      {`${
                        bid.type === 'buy' ? 'Sell' : 'Buy'
                      } ${formatLargeNumber(
                        (tradeAmount / bid.valuation) * 100
                      )}% for ${formatMoney(tradeAmount)}`}
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
