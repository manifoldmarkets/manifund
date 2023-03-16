'use client'

import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type PayUserProps = {
  userId: string
  amount: number
}

export function PayUser(props: { userId: string }) {
  const { userId } = props
  const router = useRouter()
  const [amount, setAmount] = useState(0)

  return (
    <div className="flex flex-row">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Button
        onClick={async () => {
          await payUser({ userId, amount })
          router.refresh()
        }}
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
