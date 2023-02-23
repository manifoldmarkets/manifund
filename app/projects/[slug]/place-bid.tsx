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

  return (
    <div className="flex max-w-md flex-col gap-4 rounded-md border p-4">
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
        <div className="mb-1 flex flex-row items-end gap-2">
          <Subtitle>Place a bid</Subtitle>
        </div>
      )}

      <label htmlFor="bid">Amount (USD)</label>
      <div className="flex w-full flex-row">
        <MySlider
          value={bid_portion ?? 0}
          marks={marks}
          onChange={(value) => setBidPortion(value as number)}
        />
      </div>
      <label htmlFor="valuation">Project valuation (USD)</label>
      <Input
        id="valuation"
        type="number"
        min={min_valuation}
        required
        value={valuation ?? ''}
        onChange={(event) => setValuation(Number(event.target.value))}
      />
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
        Offer {formatMoney(amount)} @ {formatMoney(valuation)}
      </Button>
    </div>
  )
}
