'use client'
import { Input } from '@/components/input'
import { formatLargeNumber, roundLargeNumber } from '@/utils/formatting'
import { useState } from 'react'

export function RoundBidAmounts() {
  const [amount, setAmount] = useState<number>(0)
  return (
    <div>
      <Input
        type="number"
        id="amount"
        name="amount"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />
      <p>Format Large Number says: {formatLargeNumber(amount)}</p>
      <p>Round Large Number says: {roundLargeNumber(amount)}</p>
    </div>
  )
}
