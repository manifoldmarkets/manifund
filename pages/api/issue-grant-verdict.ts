import { JSONContent } from '@tiptap/react'
import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { getUser, isAdmin } from '@/db/profile'
import { getProjectById } from '@/db/project'

type VerdictProps = {
  approved: boolean
  projectId: string
  adminComment: JSONContent | null
}

export default async function handler(req: NextRequest) {
  const { approved, projectId, adminComment } =
    (await req.json()) as VerdictProps
  const supabase = createAdminClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) return Response.error()
  const project = await getProjectById(supabase, projectId)
  if (!project) return Response.error()
  const newStage = approved
    ? project.min_funding < project.funding_goal
      ? 'proposal'
      : 'active'
    : 'not funded'
  await supabase.rpc('execute_grant_verdict', {
    new_stage: newStage,
    project_id: projectId,
    project_creator: project.creator,
    admin_id: user.id,
    admin_comment_content: adminComment,
  })
}
