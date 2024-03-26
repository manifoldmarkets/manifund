import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'
import { GrantAgreement } from './grant-agreement'
import { SignatureSection } from './signature-section'
import { getGrantAgreement } from '@/db/grant_agreement'
import { Row } from '@/components/layout/row'
import { Tag } from '@/components/tags'

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
    <div className="p-5">
      <Row className="gap-3">
        <h1 className="text-xl font-semibold">Grant Agreement</h1>
        <Tag
          text={
            project.signed_agreement
              ? project.approved
                ? 'COMPLETE'
                : 'AWAITING COUNTER SIGNATURE'
              : 'AWAITING SIGNATURE'
          }
          color={
            project.signed_agreement && project.approved ? 'orange' : 'rose'
          }
        />
      </Row>
      <p className="mb-5 text-sm text-gray-500">
        All grant recipients are required to agree to the terms and conditions
        outlined here before receiving funds.
      </p>
      {agreement?.signed_off_site ? (
        <div className="rounded-md bg-gray-200 p-4 text-gray-600">
          This grant agreement was signed off-site. We have grantees sign
          agreements elsewhere in cases where they need a modified version of
          the agreement, when a signatory signs on behalf of a receiving
          organization, or where they want to preserve their anonymity on
          Manifund.
        </div>
      ) : (
        <Col className="gap-16">
          <GrantAgreement project={project} agreement={agreement} />
          <SignatureSection
            project={project}
            agreement={agreement}
            userIsOwner={user?.id === project.creator}
          />
        </Col>
      )}
    </div>
  )
}
