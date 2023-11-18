import { NextApiRequest, NextApiResponse } from 'next'
import { getProjectAndProfileById, ProjectAndProfile } from '@/db/project'
import { maybeActivateProject } from '@/utils/activate-project'
import { Bid } from '@/db/bid'
import { getShareholders } from '@/app/projects/[slug]/project-tabs'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './_db'
import { getTxnsByProject } from '@/db/txn'
import { getProfileById, Profile } from '@/db/profile'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bid = req.body.record as Bid
  const supabase = createAdminClient()
  const project = await getProjectAndProfileById(supabase, bid.project)
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }
  if (project.stage === 'proposal') {
    await maybeActivateProject(supabase, bid.project)
  } else if (
    (project.type === 'cert' && bid.type === 'buy') ||
    bid.type === 'assurance buy'
  ) {
    await sendShareholderEmails(bid, project, supabase)
  }
  return res.status(200).json({ bid })
}

async function sendShareholderEmails(
  bid: Bid,
  project: ProjectAndProfile,
  supabase: SupabaseClient
) {
  const txns = await getTxnsByProject(supabase, bid.project)
  const bidder = await getProfileById(supabase, bid.bidder)
  if (!bidder) {
    return
  }
  const shareholders = getShareholders(txns)
  for (const shareholder of shareholders) {
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF,
      {
        notifText: genBidText(bidder.full_name, bid, project),
        buttonUrl: `manifund.org/projects/${project.slug}?tab=bids`,
        buttonText: 'See offer',
        subject: `New offer from ${bidder.full_name} on "${project.title}"`,
      },
      shareholder.profile.id
    )
  }
}

function genBidText(bidderName: string, bid: Bid, project: ProjectAndProfile) {
  return `${bidderName} has made a ${bid.type} offer for ${Math.round(
    (bid.amount / bid.valuation) * 100
  )}% equity at a valuation of $${bid.valuation} for the project "${
    project.title
  }" on Manifund.`
}
