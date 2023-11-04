import { NextApiRequest, NextApiResponse } from 'next'
import { getProjectAndProfileById, ProjectAndProfile } from '@/db/project'
import { maybeActivateProject } from '@/utils/activate-project'
import { Bid } from '@/db/bid'
import { getShareholders } from '@/app/projects/[slug]/project-tabs'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { SupabaseClient } from '@supabase/supabase-js'
import { trade } from '@/utils/trade'
import { createAdminClient } from './_db'
import { getTxnsByProject } from '@/db/txn'
import { getProfileById } from '@/db/profile'

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
  console.log('project', project)
  if (project.stage === 'proposal') {
    console.log('about to maybe activate')
    await maybeActivateProject(supabase, bid.project)
  } else if (project.type === 'cert') {
    console.log('about to find and make trades')
    await findAndMakeTrades(bid, supabase)
    if (bid.type === 'buy') {
      await sendShareholderEmails(bid, project, supabase)
    }
  }

  return res.status(200).json({ bid })
}

async function findAndMakeTrades(bid: Bid, supabase: SupabaseClient) {
  const newOfferType = bid.type
  const { data, error } = await supabase
    .from('bids')
    .select()
    .eq('project', bid.project)
    .order('valuation', { ascending: newOfferType === 'buy' })
  if (error) {
    throw error
  }
  const oldBids = data
    .filter((oldBid) => oldBid.bidder !== bid.bidder)
    .filter((oldBid) => oldBid.type !== newOfferType)
    .filter((oldBid) => oldBid.status === 'pending')
  let budget = bid.amount
  for (const oldBid of oldBids) {
    if (
      (newOfferType === 'buy'
        ? oldBid.valuation > bid.valuation
        : oldBid.valuation < bid.valuation) ||
      budget <= 0
    ) {
      return
    }
    const tradeAmount = Math.min(budget, oldBid.amount)
    budget -= tradeAmount
    await trade(oldBid, tradeAmount, bid.bidder)
  }
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
        notifText: `${bidder.full_name} has made a ${
          bid.type
        } offer for ${Math.round(
          (bid.amount / bid.valuation) * 100
        )}% equity at a valuation of $${bid.valuation} for the project "${
          project.title
        }" on Manifund.`,
        buttonUrl: `manifund.org/projects/${project.slug}?tab=bids`,
        buttonText: 'See offer',
        subject: `New offer from ${bidder.full_name} on "${project.title}"`,
      },
      shareholder.profile.id
    )
  }
}
