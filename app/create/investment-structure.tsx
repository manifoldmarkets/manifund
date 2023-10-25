'use client'

import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import * as RxSlider from '@radix-ui/react-slider'
import clsx from 'clsx'
import { Col } from '@/components/layout/col'
import { formatMoneyPrecise } from '@/utils/formatting'
import { InfoTooltip } from '@/components/info-tooltip'
import { Checkbox } from '@/components/input'
import { Modal } from '@/components/modal'
import { Button } from '@/components/button'

const SLIDER_MARKS = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
]

export function InvestmentStructurePanel(props: {
  minimumFunding: number
  founderPortion: number
  setFounderPortion: (val: number) => void
  agreedToTerms: boolean
  setAgreedToTerms: (val: boolean) => void
  ammPortion: number
}) {
  const {
    minimumFunding,
    founderPortion,
    setFounderPortion,
    agreedToTerms,
    setAgreedToTerms,
    ammPortion,
  } = props
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
  const [editing, setEditing] = useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
  const initialValuation =
    (100 * (minimumFunding ?? 0)) / (100 - founderPortion - ammPortion)
  return (
    <Card className="relative flex flex-col">
      <h1 className="font-semibold">Investment structure</h1>
      <p className="text-sm text-gray-600">
        We recommend using the default investment structure laid out here: this
        ensures that you&apos;ll raise at a valuation that will be able to
        support your minimum costs, that you and your investors will be able to
        make trades at any time, and that you will be rewarded for exceptional
        results. Change this only if you fully understand the implications.
      </p>
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
      <Row className="mt-5 justify-center gap-10 text-sm text-gray-600">
        <Row className="items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <label>founder</label>
        </Row>
        <Row className="items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <label>investors</label>
        </Row>
        <Row className="items-center gap-1">
          <span className="text-xs text-gray-600">[]</span>
          <label>amm</label>
          <InfoTooltip
            className="relative bottom-0.5 !h-4 !w-4 !text-gray-400"
            text="The automated market maker (amm) allows investors to buy and sell shares of your project at any time. The amm is seeded with assets it can trade using some of the founder's equity and some of the investor's dollars. All assets in the AMM are returned to the founder after the project is complete and closed."
          />
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
            editing ? 'cursor-grab active:cursor-grabbing' : '',
            'relative block rounded-full bg-orange-500 p-2 outline outline-4 outline-transparent transition-colors focus:outline-orange-500/30'
          )}
        >
          <span
            className="absolute -top-1.5 text-gray-600"
            style={{ left: (-width / 100) * ammPortion }}
          >
            {'['}
          </span>
          <span
            className="absolute -top-1.5 text-gray-600"
            style={{ right: (-width / 100) * ammPortion }}
          >
            {']'}
          </span>
        </RxSlider.Thumb>{' '}
      </RxSlider.Root>
      <div className="m-auto grid grid-cols-2 justify-between gap-5 sm:flex">
        <Col>
          <p className="text-xs text-gray-600">Equity kept by founder</p>
          <p className="text-base font-bold">{founderPortion}%</p>
        </Col>
        <Col>
          <p className="text-xs text-gray-600">Equity sold to investors</p>
          <p className="text-base font-bold">{100 - founderPortion}%</p>
        </Col>
        <Col>
          <p className="text-xs text-gray-600">Cost to seed AMM</p>
          <p className="text-base font-bold">
            {ammPortion}%,{' '}
            {formatMoneyPrecise((ammPortion * initialValuation) / 100)}
          </p>
        </Col>
        <Col>
          <p className="text-xs text-gray-600">Initial valuation</p>
          <p className="text-base font-bold">
            {formatMoneyPrecise(initialValuation)}
          </p>
        </Col>
      </div>
      <Row className="mt-5 items-center">
        <Checkbox
          checked={agreedToTerms}
          onChange={(event) => setAgreedToTerms(event.target.checked)}
        />
        <label className="ml-3 text-sm font-bold">
          <span className="text-gray-900">
            I agree to the investment structure laid out above.
          </span>
          <button
            className="ml-1 text-orange-500 hover:text-orange-600"
            onClick={() => setDetailsOpen(true)}
          >
            See details.
          </button>
          <Modal open={detailsOpen} setOpen={setDetailsOpen}>
            <Col className="items-end gap-3 px-5 py-2">
              <span className="text-sm text-gray-600">
                When you create this project, an offer will be placed on your
                behalf to sell {100 - founderPortion}% of total equity to
                investors at a valuation of{' '}
                {formatMoneyPrecise(initialValuation)}.
              </span>
              <span className="text-sm text-gray-600">
                If this offer is fully accepted by any combination of investors,
                then your project will become active and you&apos;ll recieve $
                {minimumFunding} which can be withdrawn and used for your
                project upfront. The remaining{' '}
                {formatMoneyPrecise((ammPortion * initialValuation) / 100)}{' '}
                raised from investors, in addition to {ammPortion}% of total
                equity, will be given to the automated market maker (amm), which
                will allow you and your investors to make trades at any time.
              </span>
              <span className="text-sm text-gray-600">
                Once your project is complete and closed, all assets held by the
                amm will be returned to you. You may then sell the{' '}
                {founderPortion}% of equity you hold to any retroactive
                evaluators who place offers on your project, which allows you to
                profit off of exceptional results.
              </span>
              <Button
                color="gray-outline"
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </Button>
            </Col>
          </Modal>
        </label>
      </Row>
    </Card>
  )
}
