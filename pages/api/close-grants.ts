import { isBefore } from 'date-fns'
import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/utils/email'

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
    return isBefore(closeDate, now) && project.type === 'grant'
  })
  for (const project of proposalsPastDeadline ?? []) {
    await closeGrant(
      project,
      project.bids,
      project.profiles?.full_name ?? '',
      supabase
    )
  }
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
  console.log('PROJECT', project.title)
  if (amountRaised >= project.min_funding) {
    console.log('to be accepted')
    if (!project.signed_agreement) {
      await sendTemplateEmail(
        GENERIC_NOTIF_TEMPLATE_ID,
        {
          notifText: `Your project "${project.title}" has enough funding to proceed but is awaiting your signature on the grant agreement. Please sign the agreement to activate your grant.`,
          buttonUrl: `https://manifund.org/projects/${project.slug}/agreement`,
          buttonText: 'Sign agreement',
          subject: 'Manifund: Reminder to sign your grant agreement',
        },
        project.creator
      )
    }
    if (!project.approved) {
      await sendTemplateEmail(
        GENERIC_NOTIF_TEMPLATE_ID,
        {
          notifText: `The project "${project.title}" has enough funding but is awaiting admin approval.`,
          buttonUrl: `https://manifund.org/projects/${project.slug}`,
          buttonText: 'See project',
          subject: 'Manifund: Reminder to approve project',
        },
        undefined,
        'rachel@manifund.org'
      )
    }
  } else {
    console.log('rejected')
    await supabase
      .rpc('reject_grant', {
        project_id: project.id,
      })
      .throwOnError()
    const VERDICT_TEMPLATE_ID = 31974162
    const recipientPostmarkVars = {
      recipientFullName: creatorName,
      verdictMessage: `We regret to inform you that your project, "${project.title}," has not been funded. It received $${amountRaised} in funding offers but had a minimum funding goal of $${project.min_funding}. Thank you for posting your project, and please let us know on our discord if you have any questions or feedback about the process.`,
      projectUrl: `https://manifund.org/projects/${project.slug}`,
      subject: `Manifund project not funded: "${project.title}"`,
      adminName: 'Rachel',
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
        projectUrl: `https://manifund.org/projects/${project.slug}`,
        auctionResolutionText: `This project was not funded, because it received only $${amountRaised} in funding, which is less than its' minimum funding goal of $${project.min_funding}.`,
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
