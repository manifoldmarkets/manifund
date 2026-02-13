'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { updateProjectStage } from '@/db/project'

export function CloseOldProjects(props: { projectIds: string[] }) {
  const { projectIds } = props
  const { supabase } = useSupabase()
  return (
    <Button
      disabled
      onClick={async () => {
        await Promise.all(
          projectIds.map((projectId) => updateProjectStage(supabase, projectId, 'complete'))
        )
      }}
    >
      Close old projects
    </Button>
  )
}
