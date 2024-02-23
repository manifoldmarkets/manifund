'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { giveCreatorShares } from '@/utils/upsert-project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GiveCreatorShares(props: {
  projectId: string
  creatorId: string
}) {
  const { projectId, creatorId } = props
  const { supabase } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <td>
      <Button
        loading={isSubmitting}
        disabled
        onClick={async () => {
          setIsSubmitting(true)
          await giveCreatorShares(supabase, projectId, creatorId)
          setIsSubmitting(false)
          router.refresh()
        }}
      >
        +10M
      </Button>
    </td>
  )
}
