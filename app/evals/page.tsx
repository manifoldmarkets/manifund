import { getUser } from '@/db/profile'
import { listActiveProjects } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { ProjectGroup } from '@/components/project-group'
import { TierList } from './tier-list'

export default async function EvalsPage() {
  const supabase = createServerClient()
  const [user, projects] = await Promise.all([
    getUser(supabase),
    listActiveProjects(supabase),
  ])
  return (
    <div className="p-4">
      <TierList />
      <ProjectGroup projects={projects} />
    </div>
  )
}
