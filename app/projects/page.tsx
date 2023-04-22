import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { ProjectsDisplay } from '@/components/projects-display'
import { getRegranters, Profile } from '@/db/profile'

export const revalidate = 0

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  const regranters = await getRegranters(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl pt-5">
      <AllRoundsDisplay
        rounds={rounds}
        projects={projects}
        regranters={regranters}
      />
      <ProjectsDisplay projects={projects} />
    </div>
  )
}
