'use client'
import { FullProject, LiteProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

type ProjectType = FullProject | LiteProject

export function ProjectGroup(props: {
  projects: ProjectType[]
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
        />
      ))}
    </div>
  )
}
