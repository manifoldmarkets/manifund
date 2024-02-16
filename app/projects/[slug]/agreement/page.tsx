import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'
import { GrantAgreement } from './grant-agreement'
import { SignAgreement } from './sign-agreement'

export default async function GrantAgreementPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectAndProfileBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (!project || project.type !== 'grant' || project.approved === false) {
    return <div>404</div>
  }
  return (
    <Col className="gap-5 p-5">
      <GrantAgreement project={project} />
      {user?.id === project.creator && <SignAgreement project={project} />}
    </Col>
  )
}
