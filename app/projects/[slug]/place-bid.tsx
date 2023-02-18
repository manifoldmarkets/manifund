'use client'

import { Input } from 'components/input'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

export function PlaceBid(props: { project_id: string; user: string }) {
  const { project_id, user } = props
  const [valuation, setValuation] = useState<number>(0)
  const [bid, setBid] = useState<number>(0)
  const [marks, setMarks] = useState<{ [key: number]: string }>({})
  useEffect(() => {
    setMarks({
      0: '$0',
      25: `$${(valuation / 4).toString()}`,
      50: `$${(valuation / 2).toString()}`,
      75: `$${((valuation / 4) * 3).toString()}`,
      100: `$${valuation.toString()}`,
    })
    console.log('using effect')
  }, [valuation])
  return (
    <div className="flex flex-col gap-2 p-4">
      Place a bid!
      <label htmlFor="valuation">Valuation (USD)</label>
      <Input
        id="valuation"
        type="number"
        required
        value={valuation ?? ''}
        onChange={(event) => setValuation(Number(event.target.value))}
      />
      <label htmlFor="bid">Bid (USD)</label>
      <Slider
        min={0}
        max={100}
        value={bid ?? 0}
        marks={marks}
        onChange={(value) => setBid(value as number)}
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
    </div>
  )
}

// function determineMarks(valuation: number) {
//    const quarter_num = valuation / 4;
//     const half_num = valuation / 2;
//     const three_quarter_num = valuation / 4 * 3;
//   return {
//     0: '$0',
//     25: `$${quarter_num.toString()}`,
//     50: `$${(valuation / 2).toString}`,
//     75: `$${(valuation / 4).toString}`,
//     100: `$${valuation.toString}`,
//   }
// }
