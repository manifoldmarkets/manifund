'use client'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { Project } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DonateBox(props: {
  charityId?: string
  project?: Project
  userId: string
  userSpendableFunds: number
}) {
  const { charityId, project, userId, userSpendableFunds } = props
  const [amount, setAmount] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  let errorMessage = null
  if (amount && amount > userSpendableFunds) {
    errorMessage = `You don't have enough funds to donate $${amount}. You can donate up to $${userSpendableFunds}.`
  } else if (amount && amount < 10) {
    errorMessage = `You must donate at least $10.`
  }
  return (
    <Card className="flex flex-col gap-3 p-6">
      <Row className="justify-center gap-1">
        <label htmlFor="amount" className="relative top-3">
          Amount: $
        </label>
        <Input
          type="number"
          id="amount"
          autoComplete="off"
          required
          value={amount ? amount : ''}
          placeholder="0"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
      </Row>
      {errorMessage && (
        <p className="text-center text-sm text-rose-500">{errorMessage}</p>
      )}
      <Button
        onClick={async () => {
          setIsSubmitting(true)
          if (project && project.stage === 'proposal') {
            const res = await fetch('/api/place-bid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: project.id,
                projectStage: project.stage,
                bidderId: userId,
                valuation: 0,
                amount,
                type: 'donate',
              }),
            })
          } else if (project || charityId) {
            const res = await fetch('/api/transfer-money', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fromId: userId,
                toId: charityId ?? project?.creator,
                amount,
                projectId: project?.id,
              }),
            })
          }
          setIsSubmitting(false)
          router.refresh()
        }}
        disabled={!amount}
        loading={isSubmitting}
      >
        Donate
      </Button>
    </Card>
  )
}
