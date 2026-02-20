'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'
import { Masonry } from 'react-plock'

export function ProjectGroup(props: { projects: FullProject[]; prices?: { [k: string]: number } }) {
  const { projects, prices } = props
  return (
    <Masonry
      items={projects}
      config={{
        columns: [1, 2],
        gap: [16, 16],
        media: [640, 1024],
      }}
      render={(item, idx) => (
        <ProjectCard
          key={idx}
          project={item}
          valuation={prices ? prices[item.id] : undefined}
        />
      )}
    />
  )
}
