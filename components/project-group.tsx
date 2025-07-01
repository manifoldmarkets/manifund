'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'
import { Masonry } from 'masonic'

export function ProjectGroup(props: {
  projects: FullProject[]
  prices?: { [k: string]: number }
}) {
  const { projects, prices } = props
  return (
    <Masonry
      items={projects}
      columnCount={2}
      columnGutter={16}
      rowGutter={0}
      render={({ data }) => (
        <div className="mb-4 break-inside-avoid">
          <ProjectCard
            project={data}
            valuation={prices ? prices[data.id] : undefined}
          />
        </div>
      )}
    />
  )
}
