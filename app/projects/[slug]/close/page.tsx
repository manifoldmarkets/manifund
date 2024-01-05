import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import {
  FullProject,
  getProjectAndProfileBySlug,
  ProjectAndProfile,
} from '@/db/project'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tag } from '@/components/tags'
import { format } from 'date-fns'
import { CloseProjectForm } from './close-form'

export default async function CloseProjectPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectAndProfileBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (
    !project ||
    project.stage !== 'active' ||
    !user ||
    project.creator !== user.id
  ) {
    return <div>404</div>
  }
  return (
    <Col className="gap-3 p-5">
      <h1 className="text-2xl font-bold">Close project - {project.title}</h1>
      <p className="text-sm text-gray-600">
        Closing this project ends the grant period, marks the project as
        complete, and means you will not be asked for further project updates in
        the future. Do this if you have completed the project as described in
        the initial proposal, have spent all of the funds you recieved, and/or
        do not plan to work on this project further.
      </p>
      <p className="text-sm text-gray-600">
        <strong>Your report will be posted as a public comment.</strong> If
        there&apos;s anything you&apos;d like to share with Manifund but cannot
        post publicly, you can email rachel@manifund.org.
      </p>
      <CloseProjectForm projectSlug={slug} />
    </Col>
  )
}
