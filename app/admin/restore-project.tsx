'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RestoreProject(props: { projectId: string; stage: string }) {
  const { projectId, stage } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (stage !== 'not funded') {
    return null
  }

  return (
    <button
      disabled={isSubmitting}
      className="cursor-pointer whitespace-nowrap text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
      onClick={async () => {
        if (
          !window.confirm(
            'Restore this project? This extends its funding deadline to 30 days from today and un-declines its bids.'
          )
        ) {
          return
        }
        setIsSubmitting(true)
        await fetch('/api/restore-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        })
        setIsSubmitting(false)
        router.refresh()
      }}
    >
      {isSubmitting ? 'Restoring…' : 'Restore'}
    </button>
  )
}
