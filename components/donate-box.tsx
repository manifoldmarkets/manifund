'use client'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { Input } from '@/components/input'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Row } from './layout/row'
import { Modal } from './modal'
import { Tooltip } from './tooltip'

export function DonateBox(props: {
  charity?: Profile
  project?: Project
  userId: string
  maxDonation: number
}) {
  const { charity, project, userId, maxDonation } = props
  const [amount, setAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isBid = project && project.stage === 'proposal'

  let errorMessage = null
  if (amount && amount > maxDonation) {
    errorMessage = `You don't have enough funds to donate $${amount}. You can donate up to $${maxDonation}.`
  } else if (amount && amount < 10) {
    errorMessage = `You must donate at least $10.`
  }
  return (
    <Card className="flex flex-col gap-3 p-5">
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
      <Row className="items-center justify-between">
        <Input
          type="number"
          id="amount"
          autoComplete="off"
          value={amount !== 0 ? amount : ''}
          placeholder="Amount (USD)"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <Tooltip text={errorMessage ?? ''}>
          <Button
            onClick={async () => {
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
                    fromId: userId,
                    toId: charity?.id ?? project?.creator,
                    amount,
                    projectId: project?.id,
                  }),
                })
              }
              setIsSubmitting(false)
              router.refresh()
            }}
            className="font-semibold"
            disabled={!amount || errorMessage !== null}
            loading={isSubmitting}
          >
            Donate
          </Button>
        </Tooltip>
      </Row>
      <Row className="justify-center"></Row>
    </Card>
  )
}
