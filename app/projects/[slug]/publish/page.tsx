import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectWithCausesBySlug } from '@/db/project'
import { getPrizeCause, listSimpleCauses } from '@/db/cause'
import React from 'react'
import { PublishProjectForm } from './publish-form'

export default async function PublishProjectPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectWithCausesBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (
    !project ||
    !(project.stage === 'draft') ||
    !(user?.id === project.creator)
  ) {
    return <div>404</div>
  }
  const causesList = await listSimpleCauses(supabase)
  const prizeCause = await getPrizeCause(
    project.causes.map((c) => c.slug),
    supabase
  )
  return (
    <PublishProjectForm
      causesList={causesList}
      prizeCause={prizeCause}
      project={project}
    />
  )
}
