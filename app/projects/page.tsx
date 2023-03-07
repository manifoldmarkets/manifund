import { createServerClient } from '@/db/supabase-server'
import { ProjectCard } from '@/components/project-card'
import { listProjects } from '@/db/project'
import { CalendarIcon } from '@heroicons/react/24/solid'

export default async function Projects() {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)
  const proposalProjects = projects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'ACX Mini-Grants')
  const indieProjects = projects
    .filter((project) => project.stage == 'proposal')
    .filter((project) => project.round == 'Independent')
  const activeProjects = projects.filter((project) => project.stage == 'active')
  return (
    <div className="bg-dark-200 max-w-4xl">
      <div className="flex flex-col gap-10 p-4">
        {proposalProjects.length > 0 && (
          <div>
            <h1 className="text-2xl font-bold">
              ACX Forecasting Mini-Grants Round
            </h1>
            <div className="my-2 text-gray-600">
              <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
              Auctions close <span className="text-black">Mar 12, 2023</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {proposalProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  creator={project.profiles}
                  numComments={project.comments.length}
                  bids={project.bids.filter((bid) => bid.status == 'pending')}
                  txns={project.txns}
                />
              ))}
            </div>
          </div>
        )}
        {indieProjects.length > 0 && (
          <div>
            <h1 className="text-2xl font-bold">Independent Proposals</h1>
            <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {indieProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  creator={project.profiles}
                  numComments={project.comments.length}
                  bids={project.bids.filter((bid) => bid.status == 'pending')}
                  txns={project.txns}
                />
              ))}
            </div>
          </div>
        )}
        {activeProjects.length > 0 && (
          <div>
            <h1 className="text-2xl font-bold">Active Projects</h1>
            <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  creator={project.profiles}
                  numComments={project.comments.length}
                  bids={project.bids.filter((bid) => bid.status == 'pending')}
                  txns={project.txns}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
