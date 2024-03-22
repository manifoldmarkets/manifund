import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'
import { GrantAgreement } from './grant-agreement'
import { SignAgreement } from './sign-agreement'
import { getGrantAgreement } from '@/db/grant_agreement'

export default async function GrantAgreementPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectAndProfileBySlug(supabase, slug)
  if (!project || project.approved === false) {
    return <div>404</div>
  }
  console.log(project.id)
  const agreement = await getGrantAgreement(supabase, project.id)
  if (!agreement) {
    return <div>404</div>
  }
  const user = await getUser(supabase)

  return (
    <Col className="gap-5 p-5">
      <GrantAgreement project={project} agreement={agreement} />
      <SignAgreement
        project={project}
        agreement={agreement}
        userIsOwner={user?.id === project.creator}
      />
    </Col>
  )
}
