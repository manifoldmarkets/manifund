'use client'

import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import * as RxSlider from '@radix-ui/react-slider'
import clsx from 'clsx'
import { Col } from '@/components/layout/col'
import { formatMoneyPrecise } from '@/utils/formatting'

const SLIDER_MARKS = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
]

export function InvestmentStructurePanel(props: {
  minimumFunding: number
  ammPortion: number
}) {
  const { minimumFunding, ammPortion } = props
  const sliderRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!sliderRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      setWidth(sliderRef.current?.clientWidth ?? 0)
    })
    resizeObserver.observe(sliderRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  const [founderPortion, setFounderPortion] = useState<number>(50)
  const [editing, setEditing] = useState<boolean>(false)
  const initialValuation =
    (100 * (minimumFunding ?? 0)) / (100 - founderPortion - ammPortion)
  return (
    <Card className="relative flex flex-col">
      <button
        className="absolute right-2 top-2 flex cursor-pointer items-center justify-center rounded-full bg-orange-500 p-1 text-white hover:bg-orange-600"
        onClick={() => setEditing(!editing)}
      >
        {editing ? (
          <span className="px-2 text-xs">save</span>
        ) : (
          <PencilIcon className="h-6 w-6 p-1" />
        )}
      </button>
      <Row className="justify-center gap-10 text-sm text-gray-500">
        <Row className="items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <p>founder</p>
        </Row>
        <Row className="items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <p>investors</p>
        </Row>
      </Row>
      <RxSlider.Root
        className={clsx(
          'mb-10 mt-5',
          'relative flex h-5 touch-none select-none items-center'
        )}
        value={[founderPortion]}
        onValueChange={([val]) =>
          val < 100 - ammPortion && val >= ammPortion
            ? setFounderPortion(val)
            : null
        }
        min={0}
        max={100}
        step={1}
        disabled={!editing}
        ref={sliderRef}
      >
        <RxSlider.Track
          className={clsx('relative h-1 grow rounded-full', 'bg-emerald-300')}
        >
          <RxSlider.Range
            className={clsx('bg-orange-300', 'absolute h-full rounded-full')}
          />{' '}
          <div className="absolute left-2.5 right-2.5 h-full">
            {SLIDER_MARKS?.map(({ value, label }) => (
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${value}%` }}
                key={value}
              >
                <div
                  className={clsx(
                    founderPortion >= value
                      ? 'bg-orange-500 focus:outline-orange-500/30'
                      : 'bg-emerald-500 focus:outline-emerald-500/30',
                    'h-2 w-2 rounded-full'
                  )}
                />
                <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-gray-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </RxSlider.Track>
        <RxSlider.Thumb
          className={clsx(
            editing ? 'h-4 w-4 cursor-grab active:cursor-grabbing' : 'h-2 w-2',
            'relative block rounded-full bg-orange-500 outline outline-4 outline-transparent transition-colors focus:outline-orange-500/30'
          )}
        >
          <span
            className={clsx(
              'absolute text-gray-500',
              editing ? '-top-1.5' : '-top-2.5'
            )}
            style={{ left: (-width / 100) * ammPortion }}
          >
            {'['}
          </span>
          <span
            className={clsx(
              'absolute text-gray-500',
              editing ? '-top-1.5' : '-top-2.5'
            )}
            style={{ right: (-width / 100) * ammPortion }}
          >
            {']'}
          </span>
        </RxSlider.Thumb>{' '}
      </RxSlider.Root>
      <Row className="m-auto justify-between gap-5">
        <Col>
          <p className="text-xs">Equity kept by founder</p>
          <p className="text-base font-bold">{founderPortion}%</p>
        </Col>
        <Col>
          <p className="text-xs">Cost to seed AMM</p>
          <p className="text-base font-bold">
            {formatMoneyPrecise((ammPortion * initialValuation) / 100)}
          </p>
        </Col>
        <Col>
          <p className="text-xs">Equity sold to investors</p>
          <p className="text-base font-bold">{100 - founderPortion}%</p>
        </Col>
        <Col>
          <p className="text-xs">Initial valuation</p>
          <p className="text-base font-bold">
            {formatMoneyPrecise(initialValuation)}
          </p>
        </Col>
      </Row>
    </Card>
  )
}
