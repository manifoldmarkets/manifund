import { createServerClient } from '@/db/supabase-server'
import { Project } from '@/db/project'
import { Profile } from '@/db/profile'
import { ProjectCard } from '@/components/project-card'
import { Bid } from '@/db/bid'

type ProjectAndCreatorAndBids = Project & { profiles: Profile } & {
  bids: Bid[]
}

export default async function Projects() {
  const projects = await listProjects()

  return (
    <div className="bg-dark-200 max-w-4xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              creator={project.profiles}
              bids={project.bids}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

async function listProjects() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles(*), bids(*)')
  if (error) {
    throw error
  }
  return data as ProjectAndCreatorAndBids[]
}
