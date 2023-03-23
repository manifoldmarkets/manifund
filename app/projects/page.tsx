import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { AllProjectsDisplay } from './all-projects-display'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl">
      <AllRoundsDisplay rounds={rounds} projects={projects} />
      <AllProjectsDisplay projects={projects} />
    </div>
  )
}
