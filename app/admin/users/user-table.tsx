'use client'

import { useState, memo } from 'react'

type UserRow = {
  id: string
  email: string
  username: string | null
  accredited: boolean
  balance: number
}

export function UserTable(props: { users: UserRow[] }) {
  return (
    <table className="mx-auto max-w-5xl table-fixed text-left text-xs">
      <colgroup>
        <col className="w-5" />
        <col className="w-[300px]" />
        <col className="w-[210px]" />
        <col className="w-7" />
        <col />
      </colgroup>
      <thead className="border-b text-[10px] uppercase tracking-wide text-zinc-400">
        <tr>
          <th className="py-0.5"></th>
          <th className="py-0.5">Email</th>
          <th className="py-0.5">Username</th>
          <th className="py-0.5">Acc</th>
          <th className="py-0.5">Balance / Pay</th>
        </tr>
      </thead>
      <tbody>
        {props.users.map((user, i) => (
          <MemoRow key={user.id} user={user} odd={i % 2 === 1} />
        ))}
      </tbody>
    </table>
  )
}

const MemoRow = memo(function UserRowComponent({ user, odd }: { user: UserRow; odd: boolean }) {
  return (
    <tr className={odd ? 'bg-zinc-100 hover:bg-zinc-200/60' : 'hover:bg-zinc-100/60'}>
      <td className="py-px">
        <a
          href={`https://supabase.com/dashboard/project/fkousziwzbnkdkldjper/editor/27095?filter=id%3Aeq%3A${user.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline h-2.5 w-2.5"
          >
            <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375 7.444 2.25 12 2.25s8.25 1.847 8.25 4.125z" />
            <path d="M3.75 9.75c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
            <path d="M3.75 13.125c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
            <path d="M3.75 16.5c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
          </svg>
        </a>
      </td>
      <td className="truncate py-px pr-2 text-zinc-500">{user.email}</td>
      <td className="truncate py-px pr-2">
        {user.username ? (
          <a href={`/${user.username}`} className="text-orange-600 hover:underline">
            {user.username}
          </a>
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>
      <td className="py-px">
        <AccreditedToggle userId={user.id} accredited={user.accredited} />
      </td>
      <td className="py-px">
        <PayControls userId={user.id} balance={user.balance} />
      </td>
    </tr>
  )
})

function AccreditedToggle({
  userId,
  accredited,
}: {
  userId: string
  accredited: boolean
}) {
  const [value, setValue] = useState(accredited)
  return (
    <button
      className="cursor-pointer text-sm leading-none"
      onClick={async () => {
        const next = !value
        setValue(next)
        await fetch('/api/verify-investor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, accredited: next }),
        })
      }}
    >
      {value ? '✅' : '❌'}
    </button>
  )
}

function PayControls({
  userId,
  balance,
}: {
  userId: string
  balance: number
}) {
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState(false)
  const [loading, setLoading] = useState(false)

  const parsed = parseFloat(amount)
  const hasAmount = !isNaN(parsed) && parsed !== 0

  return (
    <div className="flex items-center gap-1.5">
      <button
        className="w-14 cursor-pointer text-right font-mono text-xs tabular-nums hover:text-orange-600"
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
        onChange={(e) => setAmount(e.target.value.replace(/[^\d.\-]/g, ''))}
      />
      <label className="flex items-center gap-0.5">
        <input
          type="checkbox"
          className="h-3 w-3 cursor-pointer rounded border-gray-300 text-orange-600"
          checked={receipt}
          onChange={(e) => setReceipt(e.target.checked)}
        />
        <span className="text-[10px] text-gray-500">Receipt</span>
      </label>
      <button
        className="rounded bg-orange-500 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200"
        disabled={!hasAmount || loading}
        onClick={async () => {
          setLoading(true)
          await fetch('/api/pay-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              amount: parsed,
              sendDonationReceipt: receipt,
            }),
          })
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
