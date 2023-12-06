'use client'

import { Button } from '@/components/button'
import { AmountInput } from '@/components/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type PayUserProps = {
  userId: string
  amount: number
}

export function PayUser(props: { userId: string }) {
  const { userId } = props
  const router = useRouter()
  const [amount, setAmount] = useState<number>()

  return (
    <div className="flex flex-row">
      <AmountInput amount={amount} onChangeAmount={setAmount} />
      <Button
        onClick={async () => {
          await payUser({ userId, amount: amount ?? 0 })
          router.refresh()
        }}
        disabled={!amount}
      >
        Add
      </Button>
    </div>
  )
}

async function payUser(props: PayUserProps) {
  await fetch('/api/pay-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  })
}
