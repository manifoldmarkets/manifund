import { JSONContent } from '@tiptap/react'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { getUser, isAdmin } from '@/db/profile'
import { getProjectById } from '@/db/project'
import { getURL } from '@/utils/constants'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

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

  await supabase.rpc('execute_grant_verdict', {
    approved: approved,
    project_id: projectId,
    project_creator: project.creator,
    admin_id: user.id,
    admin_comment_content: adminComment,
  })

  const VERDICT_TEMPLATE_ID = 31974162
  const recipientSubject = approved
    ? 'Manifund has approved your project for funding!'
    : 'Manifund has declined to fund your project.'
  const recipientMessage = approved
    ? `We've decided to fund your project, "${project.title}"! If you've completed your grant agreement and reached your minimum funding goal, you can now withdraw any funds you've recieved for this project from your profile page.`
    : `We regret to inform you that we've decided not to fund your project, "${project.title}." We've left a comment on your project with a short explanation as to why. Please let us know on our discord of you have any questions or feedback about the process.`
  const recipientPostmarkVars = {
    recipientFullName: creator.full_name,
    verdictMessage: recipientMessage,
    projectUrl: `${getURL()}/projects/${project.slug}`,
    subject: recipientSubject,
    adminName: adminName,
  }
  await sendTemplateEmail(
    VERDICT_TEMPLATE_ID,
    recipientPostmarkVars,
    creator.id
  )
  return NextResponse.json('success')
}
