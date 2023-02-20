'use client'

import { Input } from 'components/input'
import MySlider from '@/components/slider'
import { useState, useEffect } from 'react'
import { Button } from 'components/button'
import { useSupabase } from '@/components/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'
import { Subtitle } from '@/components/subtitle'
import { formatLargeNumber, formatMoney } from '@/db/project'

export function PlaceBid(props: {
  project_id: string
  min_funding: number
  founder_portion: number
  user: string
}) {
  const { project_id, min_funding, founder_portion, user } = props
  const { supabase } = useSupabase()

  const sellable_portion = 1 - founder_portion / 10000000
  const min_valuation = min_funding / sellable_portion

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
      <Button
        type="submit"
        onClick={() => placeBid(supabase, project_id, user, valuation, amount)}
      >
        Bid {formatMoney(amount)} @ {formatMoney(valuation)}
      </Button>
    </div>
  )
}

async function placeBid(
  supabase: SupabaseClient,
  project: string,
  bidder: string,
  valuation: number,
  amount: number
) {
  const { error } = await supabase
    .from('bids')
    .insert([{ project, bidder, valuation, amount }])
  if (error) {
    throw error
  }
}
