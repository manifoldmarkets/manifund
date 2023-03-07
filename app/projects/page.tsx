import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { AllProjectsDisplay } from './all-projects-display'

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl">
      <AllProjectsDisplay projects={projects} />
    </div>
  )
}
