'use client'
import { Button } from '@/components/button'
import { Project } from '@/db/project'
import { useSupabase } from '@/db/supabase-provider'
import { add, format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SetCloseDate(props: { project: Project }) {
  const { project } = props
  const { supabase } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const newCloseDate = format(add(new Date(project.created_at), { weeks: 6 }), 'yyyy-MM-dd')
  return (
    <td>
      <Button
        loading={isSubmitting}
        disabled
        onClick={async () => {
          setIsSubmitting(true)
          await supabase
            .from('projects')
            .update({ auction_close: newCloseDate })
            .eq('id', project.id)
          setIsSubmitting(false)
          router.refresh()
        }}
      >
        set to {newCloseDate}
      </Button>
    </td>
  )
}
