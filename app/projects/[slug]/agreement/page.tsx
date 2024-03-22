import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'
import { GrantAgreement } from './grant-agreement'
import { SignAgreement } from './sign-agreement'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/db/database.types'

export default async function GrantAgreementPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectAndProfileBySlug(supabase, slug)
  if (!project || project.approved === false) {
    return <div>404</div>
  }
  const grantAgreement = await getGrantAgreement(supabase, project.id)
  const user = await getUser(supabase)

  return (
    <Col className="gap-5 p-5">
      <GrantAgreement project={project} />
      <SignAgreement
        project={project}
        userIsOwner={user?.id === project.creator}
      />
    </Col>
  )
}

type GrantAgreement =
  Database['public']['Tables']['grant_agreements']['Row'] & {
    profiles: { full_name: string; username: string }
  }
async function getGrantAgreement(supabase: SupabaseClient, projectId: string) {
  const { data } = await supabase
    .from('grant_agreements')
    .select('*, profiles(full_name, username)')
    .eq('project_id', projectId)
    .maybeSingle()
    .throwOnError()
  return data ? (data as GrantAgreement) : null
}
