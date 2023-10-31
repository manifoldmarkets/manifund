import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { Slider } from '@/components/slider'
import { Tooltip } from '@/components/tooltip'
import { Project } from '@/db/project'
import { formatPercent } from '@/utils/formatting'
import { getProposalValuation } from '@/utils/math'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AssuranceBuyBox(props: {
  project: Project
  valuation: number
  offerSizeDollars: number
  maxBuy: number
}) {
  const { project, valuation, offerSizeDollars, maxBuy } = props
  const [amount, setAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const offerSizePercent = offerSizeDollars / valuation
  const router = useRouter()
  let errorMessage = null
  if (amount && amount > maxBuy) {
    errorMessage = `You don't have enough funds to buy $${amount}. You can buy up to $${maxBuy} worth.`
  } else if (amount && amount > offerSizeDollars) {
    errorMessage = `You can't buy more than ${formatPercent(
      offerSizePercent
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
        valuation: getProposalValuation(project),
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
          Offer to buy equity directly from the founder at the initial
          valuation. This order will only go through once the founder has
          received enough buy offers to cover their minimum costs.
        </p>
      </div>
      <Row className="w-full items-center gap-2">
        $
        <Input
          value={Number(amount).toString()}
          placeholder="Amount (USD)"
          onChange={(event) => setAmount(Number(event.target.value))}
          className="w-24 max-w-full"
        />
        <Slider
          amount={amount}
          onChange={setAmount}
          min={0}
          max={offerSizeDollars}
          marks={[
            { label: formatPercent(0), value: 0 },
            {
              label: formatPercent(offerSizePercent / 4),
              value: offerSizeDollars / 4,
            },
            {
              label: formatPercent(offerSizePercent / 2),
              value: offerSizeDollars / 2,
            },
            {
              label: formatPercent((offerSizePercent / 4) * 3),
              value: (offerSizeDollars / 4) * 3,
            },
            { label: formatPercent(offerSizePercent), value: offerSizeDollars },
          ]}
        />
      </Row>
      <Row className="justify-end gap-2">
        <Tooltip text={errorMessage ?? ''}>
          <Button
            onClick={placeBid}
            className="font-semibold"
            disabled={!amount || errorMessage !== null}
            loading={isSubmitting}
          >
            Buy
          </Button>
        </Tooltip>
      </Row>
    </Card>
  )
}
