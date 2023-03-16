'use client'

import { Input } from 'components/input'
import MySlider from '@/components/slider'
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
import { makeTrade } from '@/db/txn'

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
  const fundable = valuation * sellablePortion
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
    errorMessage = `You don't hold enough equity to make this offer. You currently hold ${formatLargeNumber(
      (userSellableShares / TOTAL_SHARES) * 100
    )}% of the equity in this project and have already offered to sell ${formatLargeNumber(
      (userSellableShares / TOTAL_SHARES) * 100
    )}% of it.`
  } else if (amount > userSpendableFunds && bidType == 'buy') {
    errorMessage = `You don't have enough funds to place this bid. If all of the buy bids you have already placed are accepted, you will only have ${formatMoney(
      userSpendableFunds
    )} left.`
  } else if (valuation < minValuation && projectStage == 'proposal') {
    errorMessage = `Valuation must be at least $${minValuation} for this project to have enough funding to proceed.`
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
    .eq('type', newOfferType == 'buy' ? 'sell' : 'buy')
    .eq('status', 'pending')
    .order('valuation', { ascending: newOfferType == 'buy' })
  if (error) {
    throw error
  }
  let i = 0
  let budget = bid.amount
  while (budget > 0 && i < data.length) {
    if (
      newOfferType === 'buy'
        ? data[i].valuation > bid.valuation
        : data[i].valuation < bid.valuation
    ) {
      return
    }
    const tradeAmount = Math.min(budget, data[i].amount)
    budget -= tradeAmount
    await updateBidOnTrade(data[i], tradeAmount, supabase)
    await updateBidOnTrade(bid, tradeAmount, supabase)
    await makeTrade(
      newOfferType === 'buy' ? bid.bidder : data[i].bidder,
      newOfferType === 'buy' ? data[i].bidder : bid.bidder,
      tradeAmount,
      data[i].valuation,
      bid.project
    )
    i++
  }
}

async function updateBidOnTrade(
  bid: Bid,
  amount: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from('bids')
    .update({
      amount: bid.amount - amount,
      // May have issues with floating point arithmetic errors
      status: bid.amount === amount ?? 'resolved',
    })
    .eq('id', bid.id)
  if (error) {
    throw error
  }
}
