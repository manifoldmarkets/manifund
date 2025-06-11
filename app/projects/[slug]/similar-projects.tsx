'use client'
import { Col } from '@/components/layout/col'
import { ProjectCard } from '@/components/project-card'
import { FullProject } from '@/db/project'
import { getProjectValuation } from '@/utils/math'

export function SimilarProjects({
  similarProjects,
}: {
  similarProjects: (FullProject & { similarity: number })[]
}) {
  if (similarProjects.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No similar projects found yet. Check back later!
      </div>
    )
  }
  const projectsWithValuations = similarProjects.map((project) => ({
    project,
    valuation: getProjectValuation(project),
  }))

  return (
    <Col className="gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projectsWithValuations.map(({ project, valuation }) => (
          <ProjectCard
            key={project.id}
            project={project}
            valuation={valuation}
          />
        ))}
      </div>
    </Col>
  )
}
