import { Cause } from '@/db/cause'
import { getProfileById } from '@/db/profile'
import {
  getProjectBidsAndFollowsById,
  Project,
  ProjectAndBids,
  TOTAL_SHARES,
} from '@/db/project'
import { getTxnsByProject } from '@/db/txn'
import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import { differenceInDays, isBefore } from 'date-fns'
import { uniq } from 'lodash'
import uuid from 'react-uuid'
import { getURL } from './constants'
import { sendTemplateEmail, TEMPLATE_IDS } from './email'
import { getProposalValuation } from './math'
import { resolveAuction } from './resolve-auction'

export async function maybeActivateProject(
  supabase: SupabaseClient,
  projectId: string
) {
  const project = await getProjectBidsAndFollowsById(supabase, projectId)
  if (!project || !project.bids) {
    console.error('Project not found')
    return
  }
  const activeAuction =
    !!project.causes.find((c) => !!c.cert_params && c.cert_params.auction) &&
    project.type === 'cert'
  if (checkFundingReady(project)) {
    if (activeAuction) {
      const closeDate = new Date(`${project.auction_close}T23:59:59-07:00`)
      const now = new Date()
      if (isBefore(closeDate, now)) {
        await resolveAuction(project)
      }
    } else {
      await activateProject(
        project,
        project.project_follows.map((f) => f.follower_id)
      )
    }
  }
}

function checkFundingReady(project: ProjectAndBids) {
  const totalOffered = calcTotalOffered(project)
  const totalNeeded = calcFundingNeeded(project)
  return (
    totalOffered >= totalNeeded &&
    (project.type === 'cert' || (project.approved && project.signed_agreement))
  )
}

export function calcFundingNeeded(project: ProjectAndBids) {
  return project.type === 'grant'
    ? project.min_funding
    : project.bids.find(
        (bid) => bid.type === 'assurance sell' && bid.bidder === project.creator
      )?.amount ?? 0
}

export function calcTotalOffered(project: ProjectAndBids) {
  const fundingBids = project.bids.filter((bid) =>
    project.type === 'grant'
      ? bid.type === 'donate'
      : bid.type === 'assurance buy'
  )
  return fundingBids
    .filter((bid) => bid.status === 'pending')
    .reduce((acc, bid) => acc + bid.amount, 0)
}

export function checkReactivateEligible(project: Project, prizeCause?: Cause) {
  return (
    project.stage === 'not funded' &&
    project.type === 'cert' &&
    !!prizeCause &&
    !!prizeCause.cert_params &&
    prizeCause.cert_params.judgeUnfundedProjects
  )
}

async function activateProject(project: Project, followerIds: string[]) {
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
    await supabase
      .rpc('activate_cert', {
        project_id: project.id,
        project_creator: project.creator,
      })
      .throwOnError()
    await seedAmm(project, supabase)
  }
  const txns = await getTxnsByProject(supabase, project.id)
  const donors = uniq(
    txns
      .filter((txn) => txn.token === 'USD' && txn.from_id !== project.creator)
      .map((txn) => txn.profiles)
  )
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
  const creatorSubject = `Your project, "${project.title}" is active!`
  const creatorMessage = `Your project, "${project.title}", has completed the seed funding process and become active! You can now withdraw any funds you've received for this project from your profile page.`
  await sendTemplateEmail(
    TEMPLATE_IDS.VERDICT,
    {
      recipientFullName: creatorProfile.full_name ?? 'project creator',
      verdictMessage: creatorMessage,
      projectUrl: `${getURL()}/projects/${project.slug}`,
      subject: creatorSubject,
      adminName: 'Rachel from Manifund',
    },
    project.creator
  )
  const unnotifiedFollowers = followerIds.filter(
    (id) => id !== project.creator && !donors.find((donor) => donor?.id === id)
  )
  for (const followerId of unnotifiedFollowers) {
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF,
      {
        notifText: `This project has completed the seed funding process and become active!`,
        buttonUrl: `${getURL()}/projects/${project.slug}`,
        buttonText: 'See project',
        subject: `Manifund: ${project.title} is active!`,
      },
      followerId
    )
  }
}

export async function seedAmm(
  project: Project,
  supabase: SupabaseClient,
  ammDollars?: number
) {
  const valuation = getProposalValuation(project)
  const ammProfile = {
    username: `${project.slug}-amm`,
    id: project.id,
    type: 'amm',
  }
  await supabase.from('profiles').insert(ammProfile).throwOnError()
  const bundle = uuid()
  const usdTxn = {
    from_id: project.creator,
    to_id: project.id,
    token: 'USD',
    project: project.id,
    bundle,
    amount:
      ammDollars ?? (valuation * (project.amm_shares ?? 0)) / TOTAL_SHARES,
    type: 'inject amm liquidity',
  }
  const sharesTxn = {
    from_id: project.creator,
    to_id: project.id,
    token: project.id,
    project: project.id,
    bundle,
    amount: project.amm_shares,
    type: 'inject amm liquidity',
  }
  await supabase.from('txns').insert([usdTxn, sharesTxn]).throwOnError()
}
