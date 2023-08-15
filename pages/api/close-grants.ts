import { isBefore } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/utils/email'
import { getURL } from 'next/dist/shared/lib/utils'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  const supabase = createAdminClient()
  const { data: proposals } = await supabase
    .from('projects')
    .select('*, bids(*), profiles(full_name)')
    .eq('stage', 'proposal')
  const now = new Date()
  const proposalsPastDeadline = proposals?.filter((project) => {
    const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
    return (
      isBefore(closeDate, now) &&
      project.id === 'eeee3543-d394-43d7-b1db-eb12adaed4ab'
    )
  })
  console.log(proposalsPastDeadline)
  // proposalsPastDeadline?.forEach(async (proposal) => {
  //   await closeGrant(
  //     proposal,
  //     proposal.bids,
  //     proposal.profiles?.full_name ?? '',
  //     supabase
  //   )
  // })
  return NextResponse.json('closed grants')
}

async function closeGrant(
  project: Project,
  bids: Bid[],
  creatorName: string,
  supabase: SupabaseClient
) {
  const amountRaised = getAmountRaised(project, bids)
  const GENERIC_NOTIF_TEMPLATE_ID = 32825293
  if (amountRaised >= project.min_funding) {
    if (!project.signed_agreement) {
      await sendTemplateEmail(GENERIC_NOTIF_TEMPLATE_ID, {
        notifText: `Your project "${project.title}" has enough funding to proceed but is awaiting your signature on the grant agreement. Please sign the agreement to activate your grant.`,
        buttonUrl: `${getURL()}/projects/${project.slug}/grant-agreement`,
        buttonText: 'Sign agreement',
        subject: 'Manifund: Reminder to sign your grant agreement',
      })
    }
    if (!project.approved) {
      await sendTemplateEmail(GENERIC_NOTIF_TEMPLATE_ID, {
        notifText: `The project "${project.title}" has enough funding but is awaiting admin approval.`,
        buttonUrl: `${getURL()}/projects/${project.slug}`,
        buttonText: 'See project',
        subject: 'Manifund: Reminder to approve project',
      })
    }
  } else {
    await supabase
      .rpc('reject_grant', {
        project_id: project.id,
      })
      .throwOnError()
    const VERDICT_TEMPLATE_ID = 31974162
    const recipientPostmarkVars = {
      recipientFullName: creatorName,
      verdictMessage: `We regret to inform you that your project, "${project.title}," has not been funded because it received only ${amountRaised} in funding, which is less than its' minimum funding goal of ${project.min_funding}. Please let us know on our discord if you have any questions or feedback about the process.`,
      projectUrl: `${getURL()}/projects/${project.slug}`,
      subject: `Manifund project not funded: "${project.title}"`,
      adminName: 'Manifund team',
    }
    await sendTemplateEmail(
      VERDICT_TEMPLATE_ID,
      recipientPostmarkVars,
      project.creator
    )
    const OFFER_RESOLVED_TEMPLATE_ID = 31316141
    bids.forEach(async (bid) => {
      const bidderPostmarkVars = {
        projectTitle: project.title,
        result: 'declined',
        projectUrl: `${getURL()}/projects/${project.slug}`,
        auctionResolutionText: `This project was not funded, because it received only ${amountRaised} in funding, which is less than its' minimum funding goal of ${project.min_funding}.}`,
        bidResolutionText: `Your offer was declined.`,
      }
      await sendTemplateEmail(
        OFFER_RESOLVED_TEMPLATE_ID,
        bidderPostmarkVars,
        bid.bidder
      )
    })
  }
}
