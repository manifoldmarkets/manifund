'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

export function ProjectGroup(props: {
  projects: FullProject[]
  prices?: { [k: string]: number }
  hideRound?: boolean
}) {
  const { projects, prices, hideRound } = props
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          creator={project.profiles}
          numComments={project.comments.length}
          bids={project.bids.filter((bid) => bid.status == 'pending')}
          txns={project.txns}
          valuation={prices ? prices[project.id] : undefined}
          hideRound={hideRound}
        />
      ))}
    </div>
  )
}
