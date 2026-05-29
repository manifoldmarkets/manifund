'use client'
import { Button } from '@/components/button'
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
    <Button
      color="emerald"
      loading={isSubmitting}
      onClick={async () => {
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
      Restore project
    </Button>
  )
}
