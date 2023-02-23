import { createServerClient } from '@/db/supabase-server'
import { Project } from '@/db/project'
import { Profile } from '@/db/profile'
import { ProjectCard } from '@/components/project-card'
import { Bid } from '@/db/bid'
import { Txn } from '@/db/txn'

type ProjectAndCreatorBidsTxns = Project & { profiles: Profile } & {
  bids: Bid[]
} & { txns: Txn[] }

export default async function Projects() {
  const projects = await listProjects()

  return (
    <div className="bg-dark-200 max-w-4xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              creator={project.profiles}
              bids={project.bids}
              txns={project.txns}
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
    .select('*, profiles(*), bids(*), txns(*)')
    .order('created_at', { ascending: false })
  if (error) {
    throw error
  }
  return data as ProjectAndCreatorBidsTxns[]
}
