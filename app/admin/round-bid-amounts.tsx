'use client'
import { AmountInput } from '@/components/input'
import { formatLargeNumber, roundLargeNumber } from '@/utils/formatting'
import { useState } from 'react'

export function RoundBidAmounts() {
  const [amount, setAmount] = useState<number>()
  return (
    <div>
      <AmountInput
        id="amount"
        name="amount"
        amount={amount}
        onChangeAmount={setAmount}
        allowFloat={false}
      />
      <p>Format Large Number says: {formatLargeNumber(amount ?? 0)}</p>
      <p>Round Large Number says: {roundLargeNumber(amount ?? 0)}</p>
    </div>
  )
}
