'use client'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Profile } from '@/db/profile'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DonateBox(props: {
  charity: Profile
  user: Profile
  userSpendableFunds: number
}) {
  const { charity, user, userSpendableFunds } = props
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
    <Col className="gap-3 border border-gray-300 bg-white p-6 shadow sm:rounded-md">
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
          const res = await fetch('/api/transfer-money', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromId: user.id,
              toId: charity.id,
              amount,
            }),
          })
          const json = await res.json()
          setIsSubmitting(false)
          router.refresh()
        }}
        disabled={!amount}
        loading={isSubmitting}
      >
        Donate
      </Button>
    </Col>
  )
}
