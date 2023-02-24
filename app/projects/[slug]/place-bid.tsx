'use client'

import { Input } from 'components/input'
import MySlider from '@/components/slider'
import { useState, useEffect } from 'react'
import { Button } from 'components/button'
import { useSupabase } from '@/db/supabase-provider'
import { Subtitle } from '@/components/subtitle'
import { formatMoney } from '@/utils/formatting'
import { Database } from '@/db/database.types'
import { Select } from '@/components/select'
import { useRouter } from 'next/navigation'
import { FounderPortionBox } from './founder-portion-box'
import { Tooltip } from '@/components/tooltip'

type BidType = Database['public']['Enums']['bid_type']

export function PlaceBid(props: {
  projectId: string
  projectStage: string
  minFunding: number
  founderPortion: number
  userId: string
}) {
  const { projectId, projectStage, minFunding, founderPortion, userId } = props
  const { supabase } = useSupabase()
  const router = useRouter()

  const sellable_portion = 1 - founderPortion / 10000000
  const min_valuation = Math.round(minFunding / sellable_portion)

  const [valuation, setValuation] = useState<number>(min_valuation)
  const [bid_portion, setBidPortion] = useState<number>(0)
  const amount = (bid_portion * (valuation * sellable_portion)) / 100
  const [marks, setMarks] = useState<{ [key: number]: string }>({})
  useEffect(() => {
    setMarks({
      0: '$0',
      25: formatMoney((valuation * sellable_portion) / 4),
      50: formatMoney((valuation * sellable_portion) / 2),
      75: formatMoney(((valuation * sellable_portion) / 4) * 3),
      100: formatMoney(valuation * sellable_portion),
    })
  }, [valuation, sellable_portion])

  const [bidType, setBidType] = useState<BidType>('buy')
  const [submitting, setSubmitting] = useState(false)

  let errorMessage: string | null = null
  if (valuation < min_valuation && projectStage == 'proposal') {
    errorMessage = `Valuation must be at least $${min_valuation} for this project to have enough funding to proceed.`
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
      <div className="flex w-full flex-row">
        <MySlider
          value={bid_portion ?? 0}
          marks={marks}
          onChange={(value) => setBidPortion(value as number)}
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
      <div className="text-red-500">{errorMessage}</div>

      <Button
        type="submit"
        disabled={submitting}
        loading={submitting}
        onClick={async () => {
          setSubmitting(true)
          const { error } = await supabase.from('bids').insert([
            {
              project: projectId,
              bidder: userId,
              valuation,
              amount,
              type: bidType,
            },
          ])
          if (error) {
            throw error
          }
          setSubmitting(false)
          router.refresh()
        }}
      >
        Offer {formatMoney(amount)} @ {formatMoney(valuation)} Project Valuation
      </Button>
    </div>
  )
}
