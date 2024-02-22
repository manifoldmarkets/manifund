'use client'
import { Project } from '@/db/project'
import Link from 'next/link'
import { StageTag } from '@/components/tags'
import { orderBy } from 'lodash'
import { Table, TableRow } from '@/components/table'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'

// TODO: use full project and display amount raised, valuation, etc.
export function Projects(props: { projects: Project[] }) {
  const { projects } = props
  const sortedProjects = orderBy(projects, 'created_at', 'desc')
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">Projects</h1>
      <Table>
        {projects.length == 0 ? (
          <NoProjects />
        ) : (
          sortedProjects.map((project) => (
            <TableRow
              key={project.id}
              title={project.title}
              subtitle={<NextStep project={project} />}
              href={`/projects/${project.slug}`}
              tag={<StageTag projectStage={project.stage} />}
            />
          ))
        )}
      </Table>
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
  } else if (project.stage === 'draft') {
    return <p>pending publishing</p>
  } else {
    return null
  }
}
