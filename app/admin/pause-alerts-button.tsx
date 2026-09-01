'use client'

import { Button } from '@/components/button'
import { BellAlertIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function PauseAlertsButton(props: { projectId: string; alertsPaused: boolean }) {
  const { projectId, alertsPaused } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <Button
      size="2xs"
      color={alertsPaused ? 'gray' : 'light-orange'}
      loading={isSubmitting}
      className="flex items-center gap-1"
      onClick={async () => {
        setIsSubmitting(true)
        const response = await fetch('/api/set-alerts-paused', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, alertsPaused: !alertsPaused }),
        })
        setIsSubmitting(false)
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          toast.error(body?.error ?? 'Failed to update project alerts.')
          return
        }
        router.refresh()
      }}
    >
      {alertsPaused ? (
        <>
          <BellSlashIcon className="h-4 w-4" /> Paused
        </>
      ) : (
        <>
          <BellAlertIcon className="h-4 w-4" /> Pause
        </>
      )}
    </Button>
  )
}
