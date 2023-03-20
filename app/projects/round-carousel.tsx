'use client'
import { Carousel } from '@/components/carousel'
import { ProjectCard } from '@/components/project-card'
import { FullProject } from '@/db/project'

export function RoundCarousel(props: { projects: FullProject[] }) {
  const { projects } = props
  return (
    <Carousel>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          creator={project.profiles}
          numComments={project.comments.length}
          bids={project.bids}
          txns={project.txns}
          simple={true}
        />
      ))}
    </Carousel>
  )
}
