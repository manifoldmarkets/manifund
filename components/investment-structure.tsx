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
import { RequiredStar } from '@/components/tags'
import { CertParams } from '@/db/cause'
import { TOTAL_SHARES } from '@/db/project'

const SLIDER_MARKS = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
]

export function InvestmentStructurePanel(props: {
  minFunding: number
  founderPercent: number
  setFounderPercent: (val: number) => void
  agreedToTerms: boolean
  setAgreedToTerms: (val: boolean) => void
  certParams: CertParams
}) {
  const {
    minFunding,
    founderPercent,
    setFounderPercent,
    agreedToTerms,
    setAgreedToTerms,
    certParams,
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
  const initialValuation = calcInitialValuation(
    certParams,
    minFunding,
    founderPercent
  )
  if (initialValuation === null) {
    return <span className="text-sm text-rose-600">Something went wrong.</span>
  }
  const usingAmm = certParams.ammShares > 0
  const ammPortion = certParams.ammShares / TOTAL_SHARES
  const ammPercent = ammPortion * 100
  if (certParams.adjustableInvestmentStructure) {
    return (
      <Card className="relative flex flex-col gap-2">
        <h1 className="font-semibold">Investment structure</h1>
        <p className="text-sm text-gray-600">
          We recommend using the default investment structure laid out here:
          this ensures that you&apos;ll raise at a valuation that will be able
          to support your minimum costs, that you and your investors will be
          able to make trades at any time, and that you will be rewarded for
          exceptional results. Change this only if you fully understand the
          implications.
        </p>
        <p className="text-sm text-gray-600">
          &quot;Equity&quot; here does not refer to legal equity, but to stake
          in the specific prize selected here. That is, if this project later
          wins a different award, those who hold equity in the Manifund project
          are not entitled to a portion of that prize.
        </p>
        {certParams.adjustableInvestmentStructure && (
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
        )}
        <Row className="mt-5 justify-center gap-10 text-sm text-gray-600">
          <Row className="items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <label>founder</label>
          </Row>
          <Row className="items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <label>investors</label>
          </Row>
          {usingAmm && (
            <Row className="items-center gap-1">
              <span className="text-xs text-gray-600">[]</span>
              <label>amm</label>
              <InfoTooltip
                className="relative bottom-0.5 !h-4 !w-4 !text-gray-400"
                text="The automated market maker (amm) allows investors to buy and sell shares of your project at any time. The amm is seeded with assets it can trade using some of the founder's equity and some of the investor's dollars. All assets in the AMM are returned to the founder after the project is complete and closed."
              />
            </Row>
          )}
        </Row>
        <RxSlider.Root
          className="relative mb-10 mt-5 flex h-5 touch-none select-none items-center"
          value={[founderPercent]}
          onValueChange={([val]) =>
            val < 100 - ammPercent && val >= ammPercent
              ? setFounderPercent(val)
              : null
          }
          min={0}
          max={100}
          step={1}
          disabled={!editing}
          ref={sliderRef}
        >
          <RxSlider.Track className="relative h-1 grow rounded-full bg-emerald-300">
            <RxSlider.Range className="absolute h-full rounded-full bg-orange-300" />{' '}
            <div className="absolute left-2.5 right-2.5 h-full">
              {SLIDER_MARKS?.map(({ value, label }) => (
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${value}%` }}
                  key={value}
                >
                  <div
                    className={clsx(
                      founderPercent >= value
                        ? 'bg-orange-500'
                        : 'bg-emerald-500',
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
              editing
                ? 'cursor-grab active:cursor-grabbing'
                : ' cursor-not-allowed',
              'relative block rounded-full bg-orange-500 p-2 outline outline-4 outline-transparent transition-colors focus:outline-orange-500/30'
            )}
          >
            {usingAmm && (
              <>
                <span
                  className="absolute -top-1.5 text-gray-600"
                  style={{ left: (-width / 100) * ammPercent }}
                >
                  {'['}
                </span>
                <span
                  className="absolute -top-1.5 text-gray-600"
                  style={{ right: (-width / 100) * ammPercent }}
                >
                  {']'}
                </span>
              </>
            )}
          </RxSlider.Thumb>{' '}
        </RxSlider.Root>
        <div className="m-auto grid grid-cols-2 justify-between gap-5 sm:flex">
          <Col>
            <p className="text-xs text-gray-600">Equity kept by founder</p>
            <p className="text-base font-bold">{founderPercent}%</p>
          </Col>
          <Col>
            <p className="text-xs text-gray-600">Equity sold to investors</p>
            <p className="text-base font-bold">{100 - founderPercent}%</p>
          </Col>
          {usingAmm && (
            <Col>
              <p className="text-xs text-gray-600">Cost to seed AMM</p>
              <p className="text-base font-bold">
                {ammPercent}%,{' '}
                {formatMoneyPrecise(ammPortion * initialValuation)}
              </p>
            </Col>
          )}
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
            <RequiredStar />
            <Modal open={detailsOpen} setOpen={setDetailsOpen}>
              <Col className="items-end gap-3 px-5 py-2">
                <GenInvestmentExplanation
                  certParams={certParams}
                  minFunding={minFunding}
                  founderPercent={founderPercent}
                  ammPercent={ammPercent}
                  initialValuation={initialValuation}
                />
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
  } else {
    return (
      <Row className="mt-5 items-start">
        <Checkbox
          checked={agreedToTerms}
          onChange={(event) => setAgreedToTerms(event.target.checked)}
        />
        <span className="ml-3 leading-tight">
          <span className="text-sm font-bold text-gray-900">
            I opt to create an automated market maker (AMM) which will allow
            others to speculate on up to {ammPercent}% of the stake in my
            project&apos;s potential prize.{' '}
          </span>
          <span className="text-sm text-gray-600">
            This requires no further action on your part. If you choose to do
            this, {ammPercent}% of the &quot;equity&quot; in your project will
            be temporarily given to the AMM, along with ${certParams.ammDollars}{' '}
            from Manifund, giving your project a starting valuation of $
            {(certParams.ammDollars ?? 0) / ammPortion}. This will allow you and
            others to buy and sell shares of your project at any time, and
            incentivizes engagement with your work. Once your project is
            complete and closed, all equity held by the AMM and any money beyond
            the $20 seed from Manifund will be returned to you.
          </span>
        </span>
      </Row>
    )
  }
}

function GenInvestmentExplanation(props: {
  certParams: CertParams
  minFunding: number
  founderPercent: number
  ammPercent: number
  initialValuation: number
}) {
  const {
    certParams,
    minFunding,
    founderPercent,
    ammPercent,
    initialValuation,
  } = props
  if (certParams.proposalPhase) {
    return (
      <>
        <span className="text-sm text-gray-600">
          When you create this project, an offer will be placed on your behalf
          to sell {100 - founderPercent}% of total equity to investors at a
          valuation of {formatMoneyPrecise(initialValuation)}.
        </span>
        <span className="text-sm text-gray-600">
          If this offer is fully accepted by any combination of investors, then
          your project will become active and you&apos;ll recieve ${minFunding}{' '}
          which can be withdrawn and used for your project upfront. The
          remaining {formatMoneyPrecise((ammPercent * initialValuation) / 100)}{' '}
          raised from investors, in addition to {ammPercent}% of total equity,
          will be given to the automated market maker (amm), which will allow
          you and your investors to make trades at any time.
        </span>
        <span className="text-sm text-gray-600">
          Once your project is complete and closed, all assets held by the amm
          will be returned to you. You may then sell the {founderPercent}% of
          equity you hold to any retroactive evaluators who place offers on your
          project, which allows you to profit off of exceptional results.
        </span>
      </>
    )
  } else {
    return (
      <>
        <span className="text-sm text-gray-600">
          When you create this project, an automated market maker (AMM) will be
          seeded using {ammPercent}% of your equity and{' '}
          {formatMoneyPrecise(certParams.ammDollars ?? 0)} from Manifund. The
          AMM will allow you and potential investors to buy and sell stake in
          your project at any time. Note though that unless you choose to sell
          more equity to the AMM, you will keep at least {founderPercent}% of
          your equity.
        </span>
        <span className="text-sm text-gray-600">
          Once your project is complete and closed, all assets held by the AMM
          will be returned to you. Prizes will then be awarded in the form of
          buy offers for equity, which you can accept by selling any remaining
          equity you hold to the evaluator who placed the offer.
        </span>
        <span className="text-sm text-gray-600">
          For example, if your project earns a $1000 prize, and you hold 95% of
          your equity at the time of close, you can sell that 95% for $950.
        </span>
      </>
    )
  }
}

function calcInitialValuation(
  certParams: CertParams,
  minFunding: number,
  founderPercent: number
) {
  if (certParams.ammDollars) {
    return (certParams.ammDollars / certParams.ammShares) * TOTAL_SHARES
  } else {
    return (
      (100 * minFunding) /
      (100 - founderPercent - (certParams.ammShares / TOTAL_SHARES) * 100)
    )
  }
}
