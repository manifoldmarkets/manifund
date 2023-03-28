import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { AllProjectsDisplay } from './all-projects-display'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { getObjectSize } from '@/utils/debug'

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  console.log('projects size', getObjectSize(projects))
  const rounds = await getRounds(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl pt-5">
      <AllRoundsDisplay rounds={rounds} projects={projects} />
      <AllProjectsDisplay projects={projects} />
    </div>
  )
}
