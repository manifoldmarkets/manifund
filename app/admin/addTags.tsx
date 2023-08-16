'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
// import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AddTags(props: {
  projectId: string
  topicSlug: string
  currentTopicSlugs: string[]
  // supabase: SupabaseClient
}) {
  const { projectId, topicSlug, currentTopicSlugs } = props
  const { supabase } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <td>
      <Button
        loading={isSubmitting}
        disabled={currentTopicSlugs.includes(topicSlug)}
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
