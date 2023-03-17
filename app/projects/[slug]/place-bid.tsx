'use client'

import { Input } from 'components/input'
import { MySlider } from '@/components/slider'
import { useState, useEffect } from 'react'
import { Button } from 'components/button'
import { useSupabase } from '@/db/supabase-provider'
import { Subtitle } from '@/components/subtitle'
import {
  formatLargeNumber,
  formatMoney,
  roundLargeNumber,
} from '@/utils/formatting'
import { Database } from '@/db/database.types'
import { Select } from '@/components/select'
import { useRouter } from 'next/navigation'
import { FounderPortionBox } from './founder-portion-box'
import { Tooltip } from '@/components/tooltip'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { TOTAL_SHARES } from '@/db/project'
import uuid from 'react-uuid'

type BidType = Database['public']['Enums']['bid_type']

export function PlaceBid(props: {
  projectId: string
  projectStage: string
  minFunding: number
  founderPortion: number
  userId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    projectId,
    projectStage,
    minFunding,
    founderPortion,
    userId,
    userSpendableFunds,
    userSellableShares,
  } = props
  const { supabase } = useSupabase()
  const router = useRouter()

  const sellablePortion = 1 - founderPortion / 10000000
  const minValuation = Math.round(minFunding / sellablePortion)

  const [valuation, setValuation] = useState<number>(minValuation)
  const fundable =
    projectStage === 'proposal' ? valuation * sellablePortion : valuation
  const [amount, setAmount] = useState<number>(0)
  const [bidType, setBidType] = useState<BidType>('buy')
  const [submitting, setSubmitting] = useState(false)
  const [marks, setMarks] = useState<{ [key: number]: string }>({})
  useEffect(() => {
    setMarks({
      0: '$0',
      25: formatMoney(fundable / 4),
      50: formatMoney(fundable / 2),
      75: formatMoney((fundable / 4) * 3),
      100: formatMoney(fundable),
    })
  }, [valuation, sellablePortion])

  let errorMessage: string | null = null
  if (
    projectStage == 'active' &&
    userSellableShares < (amount / valuation) * TOTAL_SHARES &&
    bidType == 'sell'
  ) {
    errorMessage = `You don't hold enough equity to make this offer. If all of the sell offers you have already placed are accepted, you will only have ${formatLargeNumber(
      userSellableShares / TOTAL_SHARES
    )}% left.`
  } else if (amount > userSpendableFunds && bidType == 'buy') {
    errorMessage = `You don't have enough funds to place this bid. If all of the buy bids you have already placed are accepted, you will only have ${formatMoney(
      userSpendableFunds
    )} left.`
  } else if (valuation < minValuation && projectStage == 'proposal') {
    errorMessage = `Valuation must be at least $${minValuation} for this project to have enough funding to proceed.`
  } else if (amount > fundable) {
    errorMessage = `You can't bid more than ${formatMoney(
      fundable
    )} at the valuation you've set.`
  }

  return (
    <div className="flex w-full flex-col justify-between gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-md">
      <div className="flex justify-between">
        {projectStage == 'active' && (
          <div className="mb-4 flex flex-row items-end gap-2">
            <Subtitle>Offer to</Subtitle>
            <Select
              id="bid-type"
              value={bidType}
              onChange={(event) => setBidType(event.target.value as BidType)}
            >
              <option value="buy">buy shares</option>
              <option value="sell">sell shares</option>
            </Select>
          </div>
        )}
        {projectStage == 'proposal' && (
          <div className="mb-1 flex flex-row gap-1">
            <Subtitle>Place a bid</Subtitle>
          </div>
        )}
        {founderPortion > 0 && (
          <Tooltip
            text={
              'The founder chose to keep some of the equity in this project. You can only buy up to the percent of the project that they chose to sell.'
            }
          >
            <FounderPortionBox founderPortion={founderPortion / 100000} />
          </Tooltip>
        )}
      </div>

      <label htmlFor="bid">Amount (USD)</label>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <Input
          value={amount}
          type="number"
          className="w-1/3"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <MySlider
          value={100 * (amount / fundable)}
          marks={marks}
          onChange={(value) => {
            const amount = ((value as number) / 100) * fundable
            setAmount(roundLargeNumber(amount))
          }}
        />
      </div>
      <Tooltip
        className="w-48"
        text={
          'Based on the amount you expect a final funder will value the impact of this project after completion.'
        }
      >
        <label htmlFor="valuation">Project valuation (USD)</label>
      </Tooltip>
      <Input
        id="valuation"
        type="number"
        required
        value={valuation ?? ''}
        onChange={(event) => setValuation(Number(event.target.value))}
      />
      <div className="text-center text-red-500">{errorMessage}</div>

      <Button
        type="submit"
        disabled={submitting || !!errorMessage || amount === 0}
        loading={submitting}
        onClick={async () => {
          setSubmitting(true)
          const newBid = {
            id: uuid(),
            project: projectId,
            bidder: userId,
            valuation: roundLargeNumber(valuation),
            amount: roundLargeNumber(amount),
            status: 'pending',
            type: bidType,
          } as Bid
          const { error } = await supabase.from('bids').insert([newBid])
          if (error) {
            throw error
          }
          if (projectStage === 'active') {
            await findAndMakeTrades(newBid, supabase)
          }
          setSubmitting(false)
          router.refresh()
          setAmount(0)
        }}
      >
        Offer {formatMoney(amount)} @ {formatMoney(valuation)} Project Valuation
      </Button>
    </div>
  )
}

async function findAndMakeTrades(bid: Bid, supabase: SupabaseClient) {
  const newOfferType = bid.type
  const { data, error } = await supabase
    .from('bids')
    .select()
    .eq('project', bid.project)
    .order('valuation', { ascending: newOfferType === 'buy' })
  if (error) {
    throw error
  }
  const oldBids = data
    .filter((oldBid) => oldBid.bidder !== bid.bidder)
    .filter((oldBid) => oldBid.type !== newOfferType)
    .filter((oldBid) => oldBid.status === 'pending')
  let i = 0
  let budget = bid.amount
  while (budget > 0 && i < oldBids.length) {
    if (
      newOfferType === 'buy'
        ? oldBids[i].valuation > bid.valuation
        : oldBids[i].valuation < bid.valuation
    ) {
      return
    }
    const tradeAmount = Math.min(budget, oldBids[i].amount)
    budget -= tradeAmount
    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldBidId: oldBids[i].bidder,
        usdTraded: tradeAmount,
        tradePartnerId: bid.bidder,
      }),
    })
    i++
  }
}
