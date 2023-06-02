'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { StageTag } from '@/components/tags'
import { orderBy } from 'lodash'
import { differenceInMonths } from 'date-fns'

export function Projects(props: { projects: Project[] }) {
  const { projects } = props
  const sortedProjects = orderBy(projects, 'created_at', 'desc')
  return (
    <table
      role="list"
      className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
    >
      {projects.length == 0 ? (
        <NoProjects />
      ) : (
        sortedProjects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))
      )}
    </table>
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

function ProjectRow(props: { project: Project }) {
  const { project } = props
  return (
    <tr className=" hover:bg-gray-50">
      <td className="p-3 align-middle font-medium text-gray-900">
        <Link className="hover:underline" href={`/projects/${project.slug}`}>
          {project.title}
        </Link>
        <p className="mt-1 truncate text-xs font-normal text-gray-500">
          <NextStep project={project} />
        </p>
      </td>
      <td className="p-3 align-middle">
        <div className="flex flex-shrink-0 justify-end gap-2">
          <RoundTag roundTitle={project.round} />
          <StageTag projectStage={project.stage} />
        </div>
      </td>
    </tr>
  )
}

// TODO: actually check for previous updates
function NextStep(props: { project: Project }) {
  const { project } = props
  if (project.stage === 'proposal' && !project.signed_agreement) {
    return (
      <Link
        href={`/projects/${project.slug}/agreement`}
        className="mt-1 truncate text-xs font-normal text-gray-500 hover:underline"
      >
        pending grant agreement signature
      </Link>
    )
  }

  let content = ''
  if (project.stage === 'proposal' && !project.approved) {
    content = 'pending admin approval'
  } else if (project.stage === 'active') {
    const timeSince = differenceInMonths(
      new Date(),
      new Date(project.created_at)
    )
    content = `update due in ${6 - timeSince} months`
    const timeSinceLastUpdate = timeSince % 6
    if (timeSinceLastUpdate < 3) {
      content = `previous update due ${timeSinceLastUpdate} months ago`
    } else {
      content = `next update due in ${6 - timeSinceLastUpdate} months`
    }
  }
  if (content) {
    return (
      <p className="mt-1 truncate text-xs font-normal text-gray-500">
        {content}
      </p>
    )
  } else return null
}
