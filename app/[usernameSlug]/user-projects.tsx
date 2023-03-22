import { Project } from '@/db/project'
import { RoundTag } from '@/components/round-tag'
import Link from 'next/link'

export async function Projects(props: { projects: Project[] }) {
  const { projects } = props
  const projectsDisplay = projects.map((item) => (
    <li key={item.id}>
      {/* @ts-expect-error Server Component */}
      <ProjectDisplay
        title={item.title}
        slug={item.slug}
        stage={item.stage}
        round={item.round}
      />
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

async function ProjectDisplay(props: {
  title: string
  slug: string
  stage: string
  round: string
}) {
  const { title, stage, round, slug } = props
  return (
    <Link href={`/projects/${slug}`} className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">{title}</p>
          <div className="ml-2 flex flex-shrink-0">
            <RoundTag roundTitle={round} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <span className="truncate">{stage}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
