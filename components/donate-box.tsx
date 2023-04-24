'use client'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DonateBox(props: {
  charity?: Profile
  project?: Project
  userId: string
  userSpendableFunds: number
}) {
  const { charity, project, userId, userSpendableFunds } = props
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
      <div>
        <h2 className="text-center text-xl font-bold">Donate</h2>
        {charity?.type === 'individual' && (
          <p className="text-center text-sm text-gray-500">
            You are donating to this user&apos;s regranting budget, which is not
            withdrawable.
          </p>
        )}
      </div>
      <div className="flex flex-col justify-center gap-1 sm:flex-row">
        <label htmlFor="amount" className="relative text-center sm:top-3">
          Amount (USD):
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
      </div>
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
          } else if (project || charity) {
            const res = await fetch('/api/transfer-money', {
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
        disabled={!amount}
        loading={isSubmitting}
      >
        Donate
      </Button>
    </Card>
  )
}
