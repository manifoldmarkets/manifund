'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AddTags(props: {
  projectId: string
  causeSlug: string
  currentCauseSlugs: string[]
}) {
  const { projectId, causeSlug, currentCauseSlugs } = props
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
            .from('project_causes')
            .insert({ project_id: projectId, cause_slug: causeSlug })
          router.refresh()
          setIsSubmitting(false)
        }}
      >
        add {causeSlug}
      </Button>
    </td>
  )
}
