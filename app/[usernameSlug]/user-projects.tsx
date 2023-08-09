'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { StageTag } from '@/components/tags'
import { orderBy } from 'lodash'
import { ThickTableRow } from '@/components/table'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { CommentAndProject } from '@/db/comment'
import { Profile } from '@/db/profile'

export function Projects(props: {
  profile: Profile
  projects: Project[]
  comments: CommentAndProject[]
}) {
  const { projects, comments } = props
  const sortedProjects = orderBy(projects, 'created_at', 'desc')
  return (
    <div>
      <table
        role="list"
        className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
      >
        {projects.length == 0 ? (
          <NoProjects />
        ) : (
          sortedProjects.map((project) => (
            <ThickTableRow
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
      <Col className="gap-3">
        {comments.map((comment) => {
          return <p key={comment.id}>{comment.id}</p>
        })}
      </Col>
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
  } else return null
}
