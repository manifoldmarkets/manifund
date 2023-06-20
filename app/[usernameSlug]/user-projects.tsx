'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { StageTag } from '@/components/tags'
import { orderBy } from 'lodash'
import { TableRow } from '@/components/tables'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'

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
          <TableRow
            key={project.id}
            title={project.title}
            subtitle={<NextStep project={project} />}
            href={`/projects/${project.slug}`}
            tag={
              <div className="flex h-full flex-col justify-center">
                <Row className="flex-shrink-0 justify-end gap-2">
                  <Col className="justify-center">
                    <RoundTag roundTitle={project.round} />
                  </Col>
                  <Col className="justify-center">
                    <StageTag projectStage={project.stage} />
                  </Col>
                </Row>
              </div>
            }
          />
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

function NextStep(props: { project: Project }) {
  const { project } = props
  if (
    project.stage === 'proposal' &&
    !project.signed_agreement &&
    project.type === 'grant'
  ) {
    return (
      <Link
        href={`/projects/${project.slug}/agreement`}
        className="truncate text-xs font-normal text-gray-500 hover:underline"
      >
        pending grant agreement signature
      </Link>
    )
  }
  if (
    project.stage === 'proposal' &&
    project.type === 'grant' &&
    !project.approved
  ) {
    return <p>pending admin approval</p>
  } else if (project.stage === 'proposal') {
    return <p>pending sufficient pledged funds</p>
  } else return null
}
