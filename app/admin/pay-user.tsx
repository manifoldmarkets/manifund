'use client'

import { Button } from '@/components/button'
import { AmountInput, Checkbox } from '@/components/input'
import { Row } from '@/components/layout/row'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type PayUserProps = {
  userId: string
  amount: number
  sendDonationReceipt?: boolean
}

export function PayUser(props: { userId: string }) {
  const { userId } = props
  const router = useRouter()
  const [amount, setAmount] = useState<number>()
  const [sendDonationReceipt, setSendDonationReceipt] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <Row>
      <AmountInput
        className="text-sm"
        amount={amount}
        onChangeAmount={setAmount}
        allowNegative
      />
      <Row>
        <Checkbox
          checked={sendDonationReceipt}
          onChange={(event) => setSendDonationReceipt(event.target.checked)}
        />
        <span className="text-sm">Send donation receipt</span>
      </Row>
      <Button
        size="sm"
        onClick={async () => {
          setLoading(true)
          await payUser({ userId, amount: amount ?? 0, sendDonationReceipt })
          setLoading(false)
          router.refresh()
        }}
        disabled={!amount}
        loading={loading}
      >
        Add
      </Button>
    </Row>
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
