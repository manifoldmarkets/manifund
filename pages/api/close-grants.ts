import { differenceInDays, isBefore } from 'date-fns'
import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { isProd } from '@/db/env'
import { Cause, getPrizeCause } from '@/db/cause'
import { checkReactivateEligible } from '@/app/projects/[slug]/reactivate-button'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  if (!isProd()) {
    return NextResponse.json('not prod')
  }
  const supabase = createAdminClient()
  const { data: proposals, error } = await supabase
    .from('projects')
    .select(
      '*, bids(*), profiles!projects_creator_fkey(full_name), causes(slug)'
    )
    .eq('stage', 'proposal')
  if (error) {
    console.error(error)
    return NextResponse.json('error')
  }
  const now = new Date()
  const proposalsPastDeadline = proposals?.filter((project) => {
    const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
    return (
      isBefore(closeDate, now) &&
      // Only send notifs once per week
      differenceInDays(closeDate, now) % 7 === 0
    )
  })
  for (const project of proposalsPastDeadline ?? []) {
    const prizeCause = await getPrizeCause(
      project.causes.map((c) => c.slug),
      supabase
    )
    await closeProject(
      project,
      project.bids,
      project.profiles?.full_name ?? '',
      supabase,
      prizeCause
    )
  }
  return NextResponse.json('closed grants')
}

async function closeProject(
  project: Project,
  bids: Bid[],
  creatorName: string,
  supabase: SupabaseClient,
  prizeCause?: Cause
) {
  const amountRaised = getAmountRaised(project, bids)
  if (amountRaised >= project.min_funding) {
    if (project.type === 'grant' && !project.signed_agreement) {
      await sendTemplateEmail(
        TEMPLATE_IDS.GENERIC_NOTIF,
        {
          notifText: `Your project "${project.title}" has enough funding to proceed but is awaiting your signature on the grant agreement. Please sign the agreement to activate your grant.`,
          buttonUrl: `https://manifund.org/projects/${project.slug}/agreement`,
          buttonText: 'Sign agreement',
          subject: 'Manifund: Reminder to sign your grant agreement',
        },
        project.creator
      )
    }
    if (project.type === 'grant' && !project.approved) {
      await sendTemplateEmail(
        TEMPLATE_IDS.GENERIC_NOTIF,
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
    await supabase
      .rpc('reject_proposal', {
        project_id: project.id,
      })
      .throwOnError()
    const reactivateEligible = checkReactivateEligible(project, prizeCause)
    const recipientPostmarkVars = {
      recipientFullName: creatorName,
      verdictMessage: `We regret to inform you that your project, "${
        project.title
      }," has not been funded. It received $${amountRaised} in funding offers but had a minimum funding goal of $${
        project.min_funding
      }. ${
        reactivateEligible
          ? "You can activate your project from your project page if you'd like your project to stay eligible for trading and retroactive funding, though you will still not recieve any upfront funding."
          : ''
      } Thank you for posting your project, and please let us know on our discord if you have any questions or feedback about the process.`,
      projectUrl: `https://manifund.org/projects/${project.slug}`,
      subject: `Manifund project not funded: "${project.title}"`,
      adminName: 'Rachel',
    }
    await sendTemplateEmail(
      TEMPLATE_IDS.VERDICT,
      recipientPostmarkVars,
      project.creator
    )
    bids.forEach(async (bid) => {
      const bidderPostmarkVars = {
        projectTitle: project.title,
        result: 'declined',
        projectUrl: `https://manifund.org/projects/${project.slug}`,
        auctionResolutionText: `This project was not funded, because it received only $${amountRaised} in funding, which is less than its' minimum funding goal of $${project.min_funding}.`,
        bidResolutionText: `Your offer was declined.`,
      }
      await sendTemplateEmail(
        TEMPLATE_IDS.OFFER_RESOLVED,
        bidderPostmarkVars,
        bid.bidder
      )
    })
  }
}
