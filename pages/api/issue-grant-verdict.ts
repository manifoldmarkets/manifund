import { JSONContent } from '@tiptap/react'
import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { getUser, isAdmin, Profile } from '@/db/profile'
import { getProjectById } from '@/db/project'
import { getURL } from '@/utils/constants'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'
import { getTxnsByProject } from '@/db/txn'
import { uniq } from 'lodash'
import { getBidsByProject } from '@/db/bid'

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

  const VERDICT_EMAIL_TEMPLATE_ID = 31974162
  const siteUrl = getURL()
  const recipientSubject =
    newStage === 'not funded'
      ? 'Manifund has declined to fund your project.'
      : 'Manifund has approved your project for funding!'
  const recipientMessage = 'not funded'
    ? `We regret to inform you that we've decided not to fund your project, "${project.title}." We've left a comment on your project with a short explanation as to why. Please let us know on our discord of you have any questions or feedback about the process.`
    : `We've decided to fund your project, ${project.title}! You can now withdraw any funds you've recieved for this project from your profile page.`
  const recipientPostmarkVars = {
    recipientFullName: creator.full_name,
    verdictMessage: recipientMessage,
    projectUrl: `${siteUrl}/projects/${project.slug}`,
    subject: recipientSubject,
    adminName: adminName,
  }
  await sendTemplateEmail(
    VERDICT_EMAIL_TEMPLATE_ID,
    recipientPostmarkVars,
    creator.id
  )

  const bids = await getBidsByProject(supabase, project.id)
  const donors = uniq(bids.map((bid) => bid.profiles)) as Profile[]
  const donorSubject =
    newStage === 'not funded'
      ? `Manifund has declined to fund "${project.title}."`
      : `Manifund has approved "${project.title}" project for funding!`
  const donorMessage =
    newStage === 'not funded'
      ? `We regret to inform you that we've decided not to fund the project, "${project.title}," which you offered to donate to. We've left a comment on the project with a short explanation as to why. Please let us know on our discord of you have any questions or feedback about the process.`
      : `We've decided to approve ${creator.full_name}'s project, "${project.title}," for funding! Thank you for your contribution.`

  await Promise.all(
    donors.map((donor) =>
      sendTemplateEmail(VERDICT_EMAIL_TEMPLATE_ID, {
        recipientFullName: donor.full_name,
        verdictMessage: donorMessage,
        projectUrl: `${siteUrl}/projects/${project.slug}`,
        subject: donorSubject,
        adminName: adminName,
      })
    )
  )
}
