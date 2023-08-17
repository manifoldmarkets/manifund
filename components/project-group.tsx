'use client'
import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'
import { MiniTopic } from '@/db/topic'

export function ProjectGroup(props: {
  projects: FullProject[]
  topicsList: MiniTopic[]
  prices?: { [k: string]: number }
}) {
  const { projects, topicsList, prices } = props
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          valuation={prices ? prices[project.id] : undefined}
          topics={topicsList.filter(
            (topic) =>
              !!project.project_topics.find(
                (project_topic) => project_topic.topic_slug === topic.slug
              )
          )}
        />
      ))}
    </div>
  )
}
