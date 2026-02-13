import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, isAdmin } from '@/db/profile'
import { getProjectWithCausesBySlug } from '@/db/project'
import { getPrizeCause, listSimpleCauses } from '@/db/cause'
import React from 'react'
import { PublishProjectForm } from './publish-form'

export default async function PublishProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const supabase = await createServerSupabaseClient()
  const project = await getProjectWithCausesBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (
    !project ||
    !(project.stage === 'draft') ||
    !(user?.id === project.creator || isAdmin(user))
  ) {
    return <div>404</div>
  }
  const causesList = await listSimpleCauses(supabase)
  const prizeCause = await getPrizeCause(
    project.causes.map((c) => c.slug),
    supabase
  )
  return <PublishProjectForm causesList={causesList} prizeCause={prizeCause} project={project} />
}
