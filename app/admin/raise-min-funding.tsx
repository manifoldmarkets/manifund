'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RaiseMinFunding(props: {
  projectId: string
  minFunding: number
}) {
  const { projectId, minFunding } = props
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
          await supabase
            .from('projects')
            .update({ min_funding: 500 })
            .eq('id', projectId)
          setIsSubmitting(false)
          router.refresh()
        }}
      >
        set to $500
      </Button>
    </td>
  )
}
