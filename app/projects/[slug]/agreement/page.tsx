import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { GrantAgreementPageContent } from './grant-agreement-content'

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
  return <GrantAgreementPageContent project={project} userId={user?.id} />
}
