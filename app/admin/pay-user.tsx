'use client'

import { useState } from 'react'

export type PayUserProps = {
  userId: string
  amount: number
  sendDonationReceipt?: boolean
}

export function PayUser(props: { userId: string; balance: number }) {
  const { userId, balance } = props
  const [amount, setAmount] = useState('')
  const [sendDonationReceipt, setSendDonationReceipt] = useState(false)
  const [loading, setLoading] = useState(false)

  const parsed = parseFloat(amount)
  const hasAmount = !isNaN(parsed) && parsed !== 0

  return (
    <div className="flex items-center gap-1.5">
      <button
        className="cursor-pointer font-mono text-xs tabular-nums hover:text-orange-600"
        onClick={() => setAmount((-balance).toString())}
        title="Click to prefill withdrawal"
      >
        {Number(balance.toFixed(2))}
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="w-16 rounded border border-gray-300 px-1.5 py-0.5 text-xs tabular-nums focus:border-orange-500 focus:outline-none"
        placeholder="0"
        value={amount}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d.\-]/g, '')
          setAmount(v)
        }}
      />
      <label className="flex items-center gap-0.5">
        <input
          type="checkbox"
          className="h-3 w-3 cursor-pointer rounded border-gray-300 text-orange-600"
          checked={sendDonationReceipt}
          onChange={(e) => setSendDonationReceipt(e.target.checked)}
        />
        <span className="text-[10px] text-gray-500">Receipt</span>
      </label>
      <button
        className="rounded bg-orange-500 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200"
        disabled={!hasAmount || loading}
        onClick={async () => {
          setLoading(true)
          await payUser({ userId, amount: parsed, sendDonationReceipt })
          setLoading(false)
          setAmount('')
          window.location.reload()
        }}
      >
        {loading ? '...' : 'Add'}
      </button>
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
