'use client'
import { TimeLeftDisplay } from '@/app/projects/[slug]/time-left-display'
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
import { SignInButton } from './sign-in-button'

export function DonateBox(props: {
  charity?: Profile
  project?: Project
  profile?: Profile
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
    if (!profile) {
      return
    }
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
    <Card className="flex flex-col gap-3">
      <div>
        <Row className="justify-between">
          <h2 className="text-lg font-bold">
            {isBid ? 'Offer to donate' : 'Donate'}
          </h2>
          {isBid && <TimeLeftDisplay closeDate={project.auction_close ?? ''} />}
        </Row>
        {isBid && (
          <p className="text-sm font-light text-gray-500">
            You&apos;re pledging to donate if the project hits its minimum goal
            and gets approved. If not, your funds will be returned.
          </p>
        )}
        {charity?.type === 'individual' && (
          <p className="text-sm text-gray-500">
            This is a donation to this user&apos;s regranting budget, which is
            not withdrawable.
          </p>
        )}
      </div>
      {profile ? (
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
      ) : (
        <SignInButton buttonText="Sign in to donate" className="mx-auto my-4" />
      )}
    </Card>
  )
}
