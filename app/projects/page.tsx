import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { ProjectsDisplay } from '@/components/projects-display'
import { getRegranters } from '@/db/profile'

export const revalidate = 30

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  const regranters = await getRegranters(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl px-6 pt-5">
      <AllRoundsDisplay
        rounds={rounds}
        projects={projects}
        regranters={regranters}
      />
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        All projects
      </h2>
      <p className="mt-1 mb-2 text-gray-600">
        Including projects in all stages and from all rounds.
      </p>
      <ProjectsDisplay projects={projects} />
    </div>
  )
}
