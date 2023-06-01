import { JSONContent } from '@tiptap/react'
import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { getUser, isAdmin } from '@/db/profile'
import { getProjectById } from '@/db/project'
import { getURL } from '@/utils/constants'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'

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
  const adminName =
    user.email === 'rachel.weinberg12@gmail.com' ? 'Rachel' : 'Austin'
  const project = await getProjectById(supabase, projectId)
  const creator = await getProfileById(supabase, project?.creator)
  if (!project || !creator) return Response.error()
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
  const RECIPIENT_EMAIL_TEMPLATE_ID = 31974162
  const subject =
    newStage === 'not funded'
      ? 'Manifund has declined to fund your project.'
      : 'Manifund has approved your project for funding!'
  const message = 'not funded'
    ? `We regret to inform you that we've decided not to fund your project, "${project.title}." We've left a comment on your project with a short explanation as to why. Please let us know on our discord of you have any questions or feedback about the process.`
    : `We've decided to fund your project, ${project.title}! You can now withdraw any funds you've recieved for this project from your profile page.`
  const postmarkVars = {
    recipientFullName: creator.full_name,
    verdictMessage: message,
    projectUrl: `${getURL()}/projects/${project.slug}`,
    subject: subject,
    adminName: adminName,
  }
  await sendTemplateEmail(RECIPIENT_EMAIL_TEMPLATE_ID, postmarkVars, creator.id)
}
