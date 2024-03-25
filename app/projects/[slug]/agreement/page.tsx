import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'
import { GrantAgreement } from './grant-agreement'
import { SignatureSection } from './signature-section'
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
  const agreement = (await getGrantAgreement(supabase, project.id)) ?? undefined
  const user = await getUser(supabase)

  return (
    <Col className="gap-5 p-5">
      <GrantAgreement project={project} agreement={agreement} />
      <SignatureSection
        project={project}
        agreement={agreement}
        userIsOwner={true}
        // TODO: revert this to actually checking
        // userIsOwner={user?.id === project.creator}
      />
    </Col>
  )
}
