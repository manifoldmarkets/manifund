'use client'
import { Button } from '@/components/button'
import { Row } from '@/components/layout/row'
import { MiniCause } from '@/db/cause'
import { FullProject, Project } from '@/db/project'
import { LockClosedIcon, PaperAirplaneIcon } from '@heroicons/react/20/solid'
import { Edit } from './edit'

export function CreatorActionPanel(props: {
  project: FullProject
  causesList: MiniCause[]
}) {
  const { project, causesList } = props
  return (
    <Row className="justify-end">
      <Row className="items-center gap-2">
        <ProgressUpdateButton project={project} />
        <CloseProjectButton project={project} />
        <Edit project={project} causesList={causesList} />
      </Row>
    </Row>
  )
}

function ProgressUpdateButton(props: { project: Project }) {
  const { project } = props
  return (
    <Button className="flex items-center">
      <PaperAirplaneIcon className="mr-1 h-4 w-4" />
      Post progress update
    </Button>
  )
}

function CloseProjectButton(props: { project: Project }) {
  const { project } = props
  return (
    <Button className="flex items-center">
      <LockClosedIcon className="mr-1 h-4 w-4" />
      Close project
    </Button>
  )
}
