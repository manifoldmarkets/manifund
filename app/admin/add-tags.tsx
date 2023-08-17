'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AddTags(props: {
  projectId: string
  topicSlug: string
  currentTopicSlugs: string[]
}) {
  const { projectId, topicSlug, currentTopicSlugs } = props
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
            .from('project_topics')
            .insert({ project_id: projectId, topic_slug: topicSlug })
          router.refresh()
          setIsSubmitting(false)
        }}
      >
        add {topicSlug}
      </Button>
    </td>
  )
}
