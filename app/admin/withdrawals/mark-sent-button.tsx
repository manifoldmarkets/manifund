'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type MarkWithdrawalSentProps = { requestId: string }

export function MarkSentButton(props: MarkWithdrawalSentProps) {
  const { requestId } = props
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-rose-600">{error}</span>}
      <button
        className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:bg-gray-300"
        disabled={loading}
        onClick={async () => {
          // Sends the grantee their confirmation email, so guard the misclick.
          if (!window.confirm('Mark this withdrawal as sent and email the grantee?')) return
          setLoading(true)
          setError(null)
          const response = await fetch('/api/mark-withdrawal-sent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
          })
          setLoading(false)
          if (!response.ok) {
            setError((await response.json()).error ?? 'Failed')
            return
          }
          router.refresh()
        }}
      >
        {loading ? '...' : 'Mark as sent'}
      </button>
    </div>
  )
}
