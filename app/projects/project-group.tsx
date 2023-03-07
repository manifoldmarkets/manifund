import { FullProject } from '@/db/project'
import { ProjectCard } from '@/components/project-card'

export function ProjectGroup(props: {
  projects: FullProject[]
  category: string
  sortBy: string
  ascending: boolean
}) {
  const { projects, category, sortBy, ascending } = props
  const sortedProjects = sortProjects(projects, sortBy, ascending)
  return (
    <div>
      <h1 className="text-2xl font-bold">{category}</h1>
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            creator={project.profiles}
            numComments={project.comments.length}
            bids={project.bids.filter((bid) => bid.status == 'pending')}
            txns={project.txns}
          />
        ))}
      </div>
    </div>
  )
}

function sortProjects(
  projects: FullProject[],
  sortBy: string,
  ascending: boolean
) {
  projects.forEach((project) => {
    project.bids = project.bids.filter((bid) => bid.status == 'pending')
  })
  switch (sortBy) {
    case 'time created':
      if (ascending) {
        return projects.sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
      } else {
        return projects.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      }
    case 'percent funded':
      if (ascending) {
        return projects.sort((a, b) =>
          a.bids.reduce((acc, bid) => acc + bid.amount, 0) / a.min_funding >
          b.bids.reduce((acc, bid) => acc + bid.amount, 0) / b.min_funding
            ? 1
            : -1
        )
      } else {
        return projects.sort((a, b) =>
          a.bids.reduce((acc, bid) => acc + bid.amount, 0) / a.min_funding <
          b.bids.reduce((acc, bid) => acc + bid.amount, 0) / b.min_funding
            ? 1
            : -1
        )
      }
    case 'number of comments':
      if (ascending) {
        return projects.sort((a, b) =>
          a.comments.length > b.comments.length ? 1 : -1
        )
      } else {
        return projects.sort((a, b) =>
          a.comments.length < b.comments.length ? 1 : -1
        )
      }
    default:
      return projects
  }
}
