import { Button } from '@/components/button'
import { AmountInput, Input } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Slider } from '@/components/slider'
import { Tooltip } from '@/components/tooltip'
import { Project } from '@/db/project'
import {
  formatMoney,
  formatMoneyPrecise,
  formatPercent,
} from '@/utils/formatting'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AssuranceBuyBox(props: {
  project: Project
  minValuation: number
  offerSizePortion: number
  maxBuy: number
  activeAuction?: boolean
}) {
  const { project, minValuation, offerSizePortion, maxBuy, activeAuction } =
    props
  const [amount, setAmount] = useState<number | undefined>(0)
  const [valuation, setValuation] = useState<number | undefined>(minValuation)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const offerSizeDollars = offerSizePortion * (valuation ?? minValuation)
  const router = useRouter()
  let errorMessage = null
  if (!amount) {
    errorMessage = 'Please enter an amount.'
  } else if (!valuation) {
    errorMessage = 'Please enter a valuation.'
  } else if (amount && amount > maxBuy) {
    errorMessage = `You don't have enough funds to buy $${amount}. You can buy up to $${maxBuy} worth.`
  } else if (amount && amount > offerSizeDollars) {
    errorMessage = `You can't buy more than ${formatPercent(
      offerSizePortion
    )} of the project.`
  }

  const placeBid = async () => {
    setIsSubmitting(true)
    await fetch('/api/place-bid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        valuation: valuation,
        amount,
        type: 'assurance buy',
      }),
    })
    setAmount(0)
    setIsSubmitting(false)
    router.refresh()
  }
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-lg font-bold">Place a buy offer</h2>
        <p className="text-sm text-gray-500">
          Offer to buy equity directly from the founder at{' '}
          {activeAuction
            ? 'or above the minimum valuation'
            : 'the initial valuation'}
          . This order will only go through once{' '}
          {activeAuction
            ? `the auction closes on ${format(
                new Date(project.auction_close ?? 0),
                'MM/dd/yyyy'
              )}, if at that time the founder has received enough buy offers to cover their minimum costs.`
            : 'the founder has received enough buy offers to cover their minimum costs.'}
        </p>
      </div>
      {maxBuy > 0 ? (
        <Col className="gap-2">
          {activeAuction && (
            <Col>
              <label className="font-medium">Valuation</label>
              <Row className="items-center gap-2">
                $
                <AmountInput
                  amount={valuation}
                  onChangeAmount={setValuation}
                  error={valuation ? valuation < minValuation : undefined}
                  errorMessage={`Valuation must be at least $${minValuation}.`}
                  placeholder={`${formatMoney(minValuation)}+`}
                  className="w-32"
                />
              </Row>
            </Col>
          )}
          <Col>
            <label className="font-medium">Amount</label>
            <Row className="w-full items-center gap-2">
              $
              <AmountInput
                amount={amount}
                placeholder={'100'}
                onChangeAmount={setAmount}
                className="w-24 max-w-full"
              />
              <Slider
                amount={amount ?? 0}
                onChange={setAmount}
                min={0}
                max={offerSizeDollars}
                marks={[
                  { label: formatPercent(0), value: 0 },
                  {
                    label: formatPercent(offerSizePortion / 4),
                    value: offerSizeDollars / 4,
                  },
                  {
                    label: formatPercent(offerSizePortion / 2),
                    value: offerSizeDollars / 2,
                  },
                  {
                    label: formatPercent((offerSizePortion / 4) * 3),
                    value: (offerSizeDollars / 4) * 3,
                  },
                  {
                    label: formatPercent(offerSizePortion),
                    value: offerSizeDollars,
                  },
                ]}
              />
            </Row>
          </Col>
        </Col>
      ) : (
        <span className="w-full text-center italic text-gray-600">
          You have no spendable funds. Add money to your account through your
          profile page.
        </span>
      )}
      <Row className="justify-end gap-2">
        <Tooltip text={errorMessage ?? ''}>
          <Button
            onClick={placeBid}
            className="font-semibold"
            disabled={!amount || errorMessage !== null}
            loading={isSubmitting}
          >
            Buy {formatPercent(valuation ? (amount ?? 0) / valuation : 0)} at{' '}
            {formatMoneyPrecise(valuation ?? 0)} valuation
          </Button>
        </Tooltip>
      </Row>
    </Card>
  )
}
