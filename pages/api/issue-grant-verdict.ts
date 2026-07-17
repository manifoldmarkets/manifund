import { JSONContent } from '@tiptap/react'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'
import { getProjectById } from '@/db/project'
import { getURL } from '@/utils/constants'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { maybeActivateProject } from '@/utils/activate-project'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type VerdictProps = {
  approved: boolean
  projectId: string
  adminComment: JSONContent | null
  publicBenefit: string
}

export default async function handler(req: NextRequest) {
  const { approved, projectId, adminComment, publicBenefit } = (await req.json()) as VerdictProps
  const { supabase, user } = await getUserAndClient(req)
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Only admins can issue grant verdicts.' }, { status: 403 })
  }

  // Sign the verdict email with the admin's first name, from their profile
  const adminProfile = await getProfileById(supabase, user.id)
  const adminName = adminProfile?.full_name?.split(' ')[0]
  if (!adminName) {
    return NextResponse.json(
      { error: `No profile name found for admin ${user.email}.` },
      {
        status: 500,
      }
    )
  }
  const project = await getProjectById(supabase, projectId)
  const creator = await getProfileById(supabase, project?.creator)
  if (!project || !creator) {
    return NextResponse.json({ error: 'Project or project creator not found.' }, { status: 404 })
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.rpc('execute_grant_verdict', {
    approved: approved,
    project_id: projectId,
    project_creator: project.creator,
    admin_id: user.id,
    admin_comment_content: adminComment,
    public_benefit: publicBenefit,
  })
  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: `Failed to execute grant verdict: ${error.message}` },
      { status: 500 }
    )
  }

  const recipientSubject = approved
    ? 'Manifund has approved your project!'
    : 'Manifund has declined your project.'
  const recipientMessage = approved
    ? `We've approved your project, "${project.title}"! Once you've reached your minimum funding goals and signed your grant agreement, you'll be able to withdraw your funds via your profile page.`
    : `We regret to inform you that we've decided not to approve your project, "${project.title}." We've left a comment on your project with a short explanation as to why. Please let us know on our discord or by replying to that comments if you have any questions or feedback about the process.`
  const recipientPostmarkVars = {
    recipientFullName: creator.full_name,
    verdictMessage: recipientMessage,
    projectUrl: `${getURL()}/projects/${project.slug}`,
    subject: recipientSubject,
    adminName: adminName,
  }
  await sendTemplateEmail(TEMPLATE_IDS.VERDICT, recipientPostmarkVars, creator.id)
  await maybeActivateProject(supabase, projectId)
  return NextResponse.json('success')
}
