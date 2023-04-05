import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { StageTag } from '@/components/tags'

export async function Projects(props: { projects: Project[] }) {
  const { projects } = props
  const projectsDisplay = projects.map((project) => (
    <li key={project.id}>
      {/* @ts-expect-error Server Component */}
      <ProjectDisplay project={project} />
    </li>
  ))
  return (
    <div>
      <h1 className="mb-2 text-2xl">Projects</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {projects.length == 0 ? <NoProjects /> : projectsDisplay}
        </ul>
      </div>
    </div>
  )
}

function NoProjects() {
  return (
    <div className="p-4">
      No projects found. Would you like to{' '}
      <Link className="text-orange-600 hover:text-orange-500" href="/create">
        propose one?
      </Link>
    </div>
  )
}

async function ProjectDisplay(props: { project: Project }) {
  const { project } = props
  return (
    <Link href={`/projects/${project.slug}`} className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">
            {project.title}
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <RoundTag roundTitle={project.round} />
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="flex">
            <StageTag projectStage={project.stage} />
          </div>
        </div>
      </div>
    </Link>
  )
}
