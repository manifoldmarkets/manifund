'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

export function ProjectGroup(props: {
  projects: FullProject[]
  category: string
  valuations: { [k: string]: number }
}) {
  const { projects, valuations, category } = props
  return (
    <div>
      <h1 className="text-2xl font-bold">{category}</h1>
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            creator={project.profiles}
            numComments={project.comments.length}
            bids={project.bids.filter((bid) => bid.status == 'pending')}
            txns={project.txns}
            valuation={valuations[project.id]}
          />
        ))}
      </div>
    </div>
  )
}
