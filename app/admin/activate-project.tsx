'use client'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { maybeActivateProject } from '@/utils/activate-project'

export function ActivateProject(props: { projectId: string }) {
  const { projectId } = props
  const { supabase } = useSupabase()
  return (
    <td>
      <Button
        // Note: to activate projects, you need to hardcode in the correct key into
        // _db.ts/createAdminClient(), because it doesn't pick up the env var for some reason.
        disabled
        onClick={async () => {
          await maybeActivateProject(supabase, projectId)
        }}
      >
        Activate project
      </Button>
    </td>
  )
}
