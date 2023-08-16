'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'
import { Topic } from '@/db/topic'

export function ProjectGroup(props: {
  projects: FullProject[]
  prices?: { [k: string]: number }
  allTopics?: Topic[]
  hideRound?: boolean
}) {
  const { projects, prices, allTopics, hideRound } = props
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          valuation={prices ? prices[project.id] : undefined}
          topics={allTopics?.filter(
            (topic) =>
              !!project.project_topics.find(
                (project_topic) => project_topic.topic_title === topic.title
              )
          )}
          hideRound={hideRound}
        />
      ))}
    </div>
  )
}
