'use client'
import { scrollToComments } from '@/app/projects/[slug]/project-display'
import { Button } from '@/components/button'
import { Card } from '@/components/layout/card'
import { AmountInput } from '@/components/input'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'

export function DonateBox(props: {
  charity?: Profile
  project?: Project
  profile: Profile
  maxDonation: number
  setCommentPrompt?: (value: string) => void
}) {
  const { charity, project, profile, maxDonation, setCommentPrompt } = props
  const [amount, setAmount] = useState<number>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isBid = project && project.stage === 'proposal'

  let errorMessage = null
  if (amount && amount > maxDonation) {
    errorMessage = `You don't have enough funds to donate $${amount}. You can donate up to $${maxDonation}.`
  } else if (amount && amount < 10) {
    errorMessage = `You must donate at least $10.`
  }

  const donate = async () => {
    setIsSubmitting(true)
    if (project && project.stage === 'proposal') {
      await fetch('/api/place-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          valuation: 0,
          amount,
          type: 'donate',
        }),
      })
    } else if (project || charity) {
      await fetch('/api/transfer-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromId: profile.id,
          toId: charity?.id ?? project?.creator,
          amount,
          projectId: project?.id,
        }),
      })
    }
    setAmount(0)
    setIsSubmitting(false)
    router.refresh()
    if (setCommentPrompt) {
      scrollToComments(router)
      setCommentPrompt('why did you donate?')
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold">
          {isBid ? 'Offer to donate' : 'Donate'}
        </h2>
        {isBid && (
          <p className="text-sm text-gray-500">
            You are offering to donate this amount to the project on the
            condition that it eventually becomes active. Otherwise, your funds
            will remain in your Manifund account.
          </p>
        )}
        {charity?.type === 'individual' && (
          <p className="text-sm text-gray-500">
            You are donating to this user&apos;s regranting budget, which is not
            withdrawable.
          </p>
        )}
      </div>
      <Row className="items-center justify-between gap-2">
        <AmountInput
          id="amount"
          amount={amount}
          placeholder="Amount (USD)"
          onChangeAmount={setAmount}
          className="w-48 max-w-full"
        />
        <Tooltip text={errorMessage ?? ''}>
          <Button
            onClick={donate}
            className="font-semibold"
            disabled={!amount || errorMessage !== null}
            loading={isSubmitting}
          >
            Donate
          </Button>
        </Tooltip>
      </Row>
    </div>
  )
}
