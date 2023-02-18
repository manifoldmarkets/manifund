'use client'

import { Input } from 'components/input'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useState, useEffect } from 'react'
import { Button } from 'components/button'
import { useSupabase } from '@/components/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'

import clsx from 'clsx'

export function PlaceBid(props: {
  project_id: string
  min_funding: number
  founder_portion: number
  user: string
}) {
  const { project_id, min_funding, founder_portion, user } = props
  const { supabase } = useSupabase()

  const sellable_portion = 1 - founder_portion / 10000000
  const min_valuation = sellable_portion * min_funding

  const [valuation, setValuation] = useState<number>(min_valuation)
  const [bid_portion, setBidPortion] = useState<number>(0)
  const [marks, setMarks] = useState<{ [key: number]: string }>({})
  useEffect(() => {
    setMarks({
      0: '$0',
      25: `$${((valuation * sellable_portion) / 4).toString()}`,
      50: `$${((valuation * sellable_portion) / 2).toString()}`,
      75: `$${(((valuation * sellable_portion) / 4) * 3).toString()}`,
      100: `$${(valuation * sellable_portion).toString()}`,
    })
  }, [valuation, sellable_portion])
  return (
    <div className="flex flex-col gap-2 p-4">
      Place a bid!
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
      <Slider
        min={0}
        max={100}
        value={bid_portion ?? 0}
        marks={marks}
        onChange={(value) => setBidPortion(value as number)}
        className={clsx(
          ' mt-3 mb-10 mx-2 !h-1 [&>.rc-slider-rail]:bg-gray-200 w-11/12',
          '[&>.rc-slider-track]:bg-indigo-700 [&>.rc-slider-handle]:bg-indigo-500'
        )}
        railStyle={{ height: 4, top: 4, left: 0 }}
        trackStyle={{ height: 4, top: 4 }}
        handleStyle={{
          height: 24,
          width: 24,
          opacity: 1,
          border: 'none',
          boxShadow: 'none',
          top: -0.5,
        }}
        step={5}
        draggableTrack
        pushable
      />
      <Button
        type="submit"
        onClick={() =>
          placeBid(
            supabase,
            project_id,
            user,
            valuation,
            (bid_portion * (valuation * sellable_portion)) / 100
          )
        }
      >
        Place Bid
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
