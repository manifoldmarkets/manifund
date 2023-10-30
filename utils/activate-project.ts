import { getProfileById } from '@/db/profile'
import { getProjectAndBidsById, Project, ProjectAndBids } from '@/db/project'
import { getTxnsByProject } from '@/db/txn'
import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import { uniq } from 'lodash'
import { getURL } from './constants'
import { sendTemplateEmail, TEMPLATE_IDS } from './email'

export async function maybeActivateProject(
  supabase: SupabaseClient,
  projectId: string
) {
  const project = await getProjectAndBidsById(supabase, projectId)
  if (!project || !project.bids) {
    console.error('Project not found')
    return
  }
  if (checkFundingReady(project)) {
    await activateProject(project)
  }
}

function checkFundingReady(project: ProjectAndBids) {
  const fundingBids = project.bids.filter((bid) =>
    project.type === 'grant'
      ? bid.type === 'donate'
      : bid.type === 'assurance buy'
  )
  const totalOffered = fundingBids
    .filter((bid) => bid.status === 'pending')
    .reduce((acc, bid) => acc + bid.amount, 0)
  const totalNeeded =
    project.type === 'grant'
      ? project.min_funding
      : project.bids.find(
          (bid) =>
            bid.type === 'assurance sell' && bid.bidder === project.creator
        )?.amount ?? 0
  return (
    totalOffered >= totalNeeded &&
    (project.type === 'cert' || (project.approved && project.signed_agreement))
  )
}

async function activateProject(project: Project) {
  const supabase = createAdminClient()
  const creatorProfile = await getProfileById(supabase, project?.creator)
  if (!project || !creatorProfile) {
    console.error('project', project, 'creatorProfile', creatorProfile)
    return Response.error()
  }
  const isGrant = project.type === 'grant'
  if (isGrant) {
    await supabase
      .rpc('activate_grant', {
        project_id: project.id,
        project_creator: project.creator,
      })
      .throwOnError()
  } else {
    await supabase.rpc('activate_cert', {
      project_id: project.id,
      project_creator: project.creator,
    })
    // TODO: add seed amm function here
  }
  const txns = await getTxnsByProject(supabase, project.id)
  const donors = uniq(txns.map((txn) => txn.profiles))
  const donorSubject = `"${project.title}" is active!`
  const donorMessage = `The project you ${
    isGrant ? 'donated' : 'made a buy offer'
  } to, "${
    project.title
  }", has completed the seed funding process and become active! The funds you offered been sent to the project creator to be used for the project${
    isGrant
      ? ''
      : ', and the shares you purchased have been added to your portfolio'
  }.`
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
  const recipientMessage = `Your project, "${project.title}", has completed the seed funding process and become active! You can now withdraw any funds you've recieved for this project from your profile page.`
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
