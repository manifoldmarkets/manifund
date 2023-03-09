'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'
import { CalendarIcon } from '@heroicons/react/24/solid'

export function ProjectGroup(props: {
  projects: FullProject[]
  category: string
}) {
  const { projects, category } = props
  return (
    <div>
      <h1 className="text-2xl font-bold">{category}</h1>
      {category === 'ACX Mini-Grants Proposals' && (
        <div className="my-2 text-gray-600">
          <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
          Auctions close <span className="text-black">Mar 12, 2023</span>
        </div>
      )}
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((project) => (
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
  )
}
