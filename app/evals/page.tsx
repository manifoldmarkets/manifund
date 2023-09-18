import { getUser } from '@/db/profile'
import { listProjectsForEvals } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { TierList } from './tier-list'

export default async function EvalsPage() {
  const supabase = createServerClient()
  const [user, projects] = await Promise.all([
    getUser(supabase),
    listProjectsForEvals(supabase),
  ])
  return (
    <div className="p-4">
      <TierList projects={projects} />
    </div>
  )
}
