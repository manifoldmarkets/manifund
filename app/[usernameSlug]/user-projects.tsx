'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { StageTag } from '@/components/tags'
import { orderBy } from 'lodash'

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
    <Link
      href={`/projects/${project.slug}`}
      className="table-row hover:bg-gray-50"
    >
      <td className="p-3 align-middle">
        <StageTag projectStage={project.stage} />
      </td>
      <td className="py-3 align-middle text-gray-900">{project.title}</td>
      <td className="p-3 align-middle">
        <div className="flex flex-shrink-0 justify-end">
          <RoundTag roundTitle={project.round} />
        </div>
      </td>
    </Link>
  )
}
