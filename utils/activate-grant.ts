import { getProfileById } from '@/db/profile'
import { getProjectAndBidsById, Project, ProjectAndBids } from '@/db/project'
import { getTxnsByProject } from '@/db/txn'
import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import { uniq } from 'lodash'
import { getURL } from './constants'
import { sendTemplateEmail, TEMPLATE_IDS } from './email'

export async function maybeActivateGrant(
  supabase: SupabaseClient,
  projectId: string
) {
  const project = await getProjectAndBidsById(supabase, projectId)
  if (!project || !project.bids) {
    console.error('Project not found')
    return
  }
  if (checkGrantFundingReady(project)) {
    await activateGrant(project)
  }
}

function checkGrantFundingReady(project: ProjectAndBids) {
  if (project.type !== 'grant') {
    console.error('Project is not a grant')
    return false
  } else {
    const totalDonated = project.bids
      .filter((bid) => bid.status === 'pending' && bid.type === 'donate')
      .reduce((acc, bid) => acc + bid.amount, 0)
    return (
      totalDonated >= project.min_funding &&
      project.approved &&
      project.signed_agreement
    )
  }
}

async function activateGrant(project: Project) {
  const supabase = createAdminClient()
  const creatorProfile = await getProfileById(supabase, project?.creator)
  if (!project || !creatorProfile) {
    console.error('project', project, 'creatorProfile', creatorProfile)
    return Response.error()
  }
  await supabase
    .rpc('activate_grant', {
      project_id: project.id,
      project_creator: project.creator,
    })
    .throwOnError()
  const txns = await getTxnsByProject(supabase, project.id)
  const donors = uniq(txns.map((txn) => txn.profiles))
  const donorSubject = `"${project.title}" is active!`
  const donorMessage = `The project you donated to, "${project.title}", has completed the funding process and become active! Your donation has been sent to the project creator to be used for the project.`
  const siteUrl = getURL()
  await Promise.all(
    donors.map(async (donor) => {
      await sendTemplateEmail(
        TEMPLATE_IDS.VERDICT,
        {
          recipientFullName: donor?.full_name ?? 'donor',
          verdictMessage: donorMessage,
          projectUrl: `${siteUrl}/projects/${project.slug}`,
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
    TEMPLATE_IDS.VERDICT,
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
