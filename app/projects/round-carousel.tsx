'use client'
import { Carousel } from '@/components/carousel'
import { SimpleProjectCard } from '@/components/project-card'
import { RegranterCard } from '@/components/regranter-card'
import { Profile } from '@/db/profile'
import { FullProject } from '@/db/project'

export function RoundCarousel(props: {
  projects: FullProject[]
  theme: string
}) {
  const { projects, theme } = props
  return (
    <Carousel theme={theme}>
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

export function RegranterCarousel(props: {
  regranters: Profile[]
  theme: string
}) {
  const { regranters, theme } = props
  return (
    <Carousel theme={theme}>
      {regranters.map((regranter) => (
        <RegranterCard
          key={regranter.id}
          regranter={regranter}
          className="w-52"
        />
      ))}
    </Carousel>
  )
}
