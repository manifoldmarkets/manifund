'use client'

import { Input } from 'components/input'
import MySlider from '@/components/slider'
import { useState, useEffect } from 'react'
import { Button } from 'components/button'
import { useSupabase } from '@/components/supabase-provider'
import { Subtitle } from '@/components/subtitle'
import { formatMoney } from '@/db/project'
import { Database } from '@/db/database.types'
import { Select } from '@/components/select'

type BidType = Database['public']['Enums']['bid_type']

export function PlaceBid(props: {
  projectId: string
  minFunding: number
  founderPortion: number
  userId: string
}) {
  const { projectId, minFunding, founderPortion, userId } = props
  const { supabase } = useSupabase()

  const sellable_portion = 1 - founderPortion / 10000000
  const min_valuation = minFunding / sellable_portion

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

  const [bidType, setBidType] = useState<BidType>('ipo')
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="flex max-w-md flex-col gap-2 rounded-md border p-4">
      <Subtitle>Fund Project</Subtitle>
      <label htmlFor="valuation">Valuation (USD)</label>
      <Input
        id="valuation"
        type="number"
        min={min_valuation}
        required
        value={valuation ?? ''}
        onChange={(event) => setValuation(Number(event.target.value))}
      />
      <label htmlFor="bid">Bid (USD)</label>
      <MySlider
        value={bid_portion ?? 0}
        marks={marks}
        onChange={(value) => setBidPortion(value as number)}
        railStyle={{ height: 4, top: 4, left: 0 }}
        trackStyle={{ height: 4, top: 4 }}
      />
      <label htmlFor="bid-type">Bid Type</label>
      <Select
        id="bid-type"
        value={bidType}
        onChange={(event) => setBidType(event.target.value as BidType)}
      >
        <option value="ipo">IPO</option>
        <option value="buy">Buy shares</option>
        <option value="sell">Sell shares</option>
      </Select>
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
        }}
      >
        Bid {formatMoney(amount)} @ {formatMoney(valuation)}
      </Button>
    </div>
  )
}
