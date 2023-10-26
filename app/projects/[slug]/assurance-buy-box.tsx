import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card } from "@/components/layout/card"
import { Row } from "@/components/layout/row"
import { Slider } from "@/components/slider"
import { Tooltip } from "@/components/tooltip"
import { Profile } from "@/db/profile"
import { Project } from "@/db/project"
import { formatPercent } from "@/utils/formatting"
import { getProposalValuation } from "@/utils/math"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AssuranceBuyBox(props: {
  project: Project
  valuation: number
  offerSizeDollars: number
  maxBuy: number
}) {
  const { project, valuation, offerSizeDollars, maxBuy } = props
  const [amount, setAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  console.log(valuation)
  const offerSizePercent = offerSizeDollars / valuation
  console.log(offerSizePercent, '%')
  const router = useRouter()
  let errorMessage = null
  if (amount && amount > maxBuy) {
    errorMessage = `You don't have enough funds to buy $${amount}. You can buy up to $${maxBuy} worth.`
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
        <h2 className="text-lg font-bold">
          Place a buy offer
        </h2>
          <p className="text-sm text-gray-500">
            You are offering to donate this amount to the project on the
            condition that it eventually becomes active. Otherwise, your funds
            will remain in your Manifund account.
          </p>
      </div>
      <Row className="items-center gap-2 w-full">
      <Input
          type="number"
          id="amount"
          autoComplete="off"
          value={Number(amount).toString()}
          placeholder="Amount (USD)"
          onChange={(event) => setAmount(Number(event.target.value))}
          className="w-48 max-w-full"
        />
        <Slider amount={amount} onChange={setAmount} min={0} max={offerSizeDollars} marks={
          [{label: formatPercent(0), value: 0},
          {label: formatPercent(offerSizePercent / 4), value: offerSizeDollars / 4},
          {label: formatPercent(offerSizePercent / 2), value: offerSizeDollars / 2},
          {label: formatPercent(offerSizePercent / 4 * 3), value: offerSizeDollars / 4 * 3},
          {label: formatPercent(offerSizePercent), value: offerSizeDollars}]
        }/>
      </Row>
      <Row className="items-center justify-between gap-2">
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
