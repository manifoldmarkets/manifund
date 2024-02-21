import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProjectAndProfileBySlug } from '@/db/project'
import React from 'react'
import { Col } from '@/components/layout/col'

export default async function PublishProjectPage(props: {
  params: { slug: string }
}) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectAndProfileBySlug(supabase, slug)
  const user = await getUser(supabase)
  if (
    !project ||
    !(project.stage === 'pre-proposal') ||
    !(user?.id === project.creator)
  ) {
    return <div>404</div>
  }
  return (
    <Col className="gap-5 p-5">publish project page for {project?.title}</Col>
  )
}
