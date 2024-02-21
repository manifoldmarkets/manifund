import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectWithCausesBySlug } from '@/db/project'
import { getPrizeCause, listSimpleCauses } from '@/db/cause'
import React from 'react'
import { Col } from '@/components/layout/col'

export default async function PublishProjectPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectWithCausesBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (
    !project ||
    !(project.stage === 'pre-proposal') ||
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
    <Col className="gap-5 p-5">publish project page for {project?.title}</Col>
  )
}
