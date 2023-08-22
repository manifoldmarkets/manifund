'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

export function ProjectGroup(props: {
  projects: FullProject[]
  prices?: { [k: string]: number }
}) {
  const { projects, prices } = props
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          valuation={prices ? prices[project.id] : undefined}
          causes={project.causes}
        />
      ))}
    </div>
  )
}
