import { NextRequest } from 'next/server'
import { createEdgeClient } from './_db'
import { getProjectById } from '@/db/project'
import { getTxnsByProject } from '@/db/txn'
import { getURL } from 'next/dist/shared/lib/utils'
import { sendTemplateEmail } from '@/utils/email'
import { getProfileById } from '@/db/profile'
import { uniq } from 'lodash'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/lodash.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as { projectId: string }
  const supabase = createEdgeClient(req)
  // TODO: create one function to get both of these infos
  const project = await getProjectById(supabase, projectId)
  const creatorProfile = await getProfileById(supabase, project?.creator)
  if (!project || !creatorProfile) {
    return Response.error()
  }
  await supabase
    .rpc('activate_grant', {
      project_id: projectId,
      project_creator: project.creator,
    })
    .throwOnError()
  const VERDICT_TEMPLATE_ID = 31974162
  const txns = await getTxnsByProject(supabase, projectId)
  const donors = uniq(txns.map((txn) => txn.profiles))
  const donorSubject = `"${project.title}" is active!`
  const donorMessage = `The project you donated to, "${project.title}", has completed the funding process and become active! Your donation has been sent to the project creator to be used for the project.`
  await Promise.all(
    donors.map(async (donor) => {
      await sendTemplateEmail(
        VERDICT_TEMPLATE_ID,
        {
          recipientFullName: donor?.full_name ?? 'donor',
          verdictMessage: donorMessage,
          projectUrl: `${getURL()}/projects/${project.slug}`,
          subject: donorSubject,
          adminName: 'Rachel from Manifund',
        },
        donor?.id ?? ''
      )
    })
  )
  const recipientSubject = `Your project, "${project.title}" is active!`
  const recipientMessage = `Your project, "${project.title}", has completed the funding process and become active! You can now withdraw any funds you've recieved for this project from your profile page.`
  await sendTemplateEmail(
    VERDICT_TEMPLATE_ID,
    {
      recipientFullName: creatorProfile.full_name ?? 'project creator',
      verdictMessage: recipientMessage,
      projectUrl: `${getURL()}/projects/${project.slug}`,
      subject: recipientSubject,
      adminName: 'Rachel from Manifund',
    },
    project.creator
  )
}
