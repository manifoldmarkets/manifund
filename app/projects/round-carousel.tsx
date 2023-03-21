'use client'
import { Carousel } from '@/components/carousel'
import { SimpleProjectCard } from '@/components/project-card'
import { FullProject } from '@/db/project'

export function RoundCarousel(props: { projects: FullProject[] }) {
  const { projects } = props
  return (
    <Carousel>
      {projects.map((project) => (
        <SimpleProjectCard
          key={project.id}
          project={project}
          creator={project.profiles}
          numComments={project.comments.length}
          bids={project.bids}
        />
      ))}
    </Carousel>
  )
}
