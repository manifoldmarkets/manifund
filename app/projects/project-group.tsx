'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

export function ProjectGroup(props: {
  projects: FullProject[]
  category: string
}) {
  const { projects, category } = props
  return (
    <div>
      <h1 className="text-2xl font-bold">{category}</h1>
      {projects.length !== 0 ? (
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
      ) : (
        <p className="gray-500 italic">
          No projects in this category match your search.
        </p>
      )}
    </div>
  )
}
