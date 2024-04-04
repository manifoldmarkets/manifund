import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/pages/api/_db'
import { Project, TOTAL_SHARES, updateProjectStage } from '@/db/project'
import { getBidsForResolution, BidAndProfile } from '@/db/bid'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import uuid from 'react-uuid'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type Bid = Database['public']['Tables']['bids']['Row']

export async function resolveAuction(project: Project) {
  const supabase = createAdminClient()
  const bids = await getBidsForResolution(supabase, project.id)
  let founderPortion = project.founder_shares / TOTAL_SHARES
  const resolution = resolveBids(bids, project.min_funding, founderPortion)
  await sendAuctionCloseEmails(bids, project, resolution, founderPortion)
  if (resolution.valuation === -1) {
    await updateProjectStage(supabase, project.id, 'not funded')
    await updateBidsStatus(supabase, bids, resolution)
  } else {
    await updateProjectStage(supabase, project.id, 'active')
    await addTxns(supabase, project.id, bids, resolution, project.creator)
    await updateBidsStatus(supabase, bids, resolution)
  }
}

async function addTxns(
  supabase: SupabaseClient,
  projectId: string,
  bids: Bid[],
  resolution: Resolution,
  creator: string
) {
  for (const bid of bids) {
    if (resolution.amountsPaid[bid.id] > 0) {
      const actualAmountPaid = Math.floor(resolution.amountsPaid[bid.id])
      const numShares = (actualAmountPaid / resolution.valuation) * TOTAL_SHARES
      const txnBundle = uuid()
      const sharesTxn = {
        from_id: creator,
        to_id: bid.bidder,
        amount: numShares,
        token: projectId,
        project: projectId,
        bundle: txnBundle,
        type: 'user to user trade',
      }
      const usdTxn = {
        from_id: bid.bidder,
        to_id: creator,
        amount: actualAmountPaid,
        token: 'USD',
        project: projectId,
        bundle: txnBundle,
        type: 'user to user trade',
      }
      const { error } = await supabase.from('txns').insert([sharesTxn, usdTxn])
      if (error) {
        console.error('createTxn', error)
      }
    }
  }
}

async function updateBidsStatus(
  supabase: SupabaseClient,
  bids: Bid[],
  resolution: Resolution
) {
  for (const bid of bids) {
    const { error } = await supabase
      .from('bids')
      .update({
        status: resolution.amountsPaid[bid.id] > 0 ? 'accepted' : 'declined',
      })
      .eq('id', bid.id)
    if (error) {
      console.error('updateBidStatus', error)
    }
  }
}

export type Resolution = {
  amountsPaid: { [key: string]: number }
  valuation: number
}
export function resolveBids(
  sortedBids: Bid[],
  minFunding: number,
  founderPortion: number
) {
  const amountsPaid = Object.fromEntries(sortedBids.map((bid) => [bid.id, 0]))
  const resolution = {
    amountsPaid,
    valuation: -1,
  } as Resolution
  let i = 0
  let totalFunding = 0
  // Starting at the bid w/ highest valuation, for each bid...
  while (i < sortedBids.length) {
    // Determine, at valuation of current bid, how much of the project is still unsold
    const valuation = sortedBids[i].valuation
    totalFunding += sortedBids[i].amount
    const unsoldPortion = 1 - founderPortion - totalFunding / valuation
    // If all shares are sold, bids go through
    if (unsoldPortion <= 0) {
      // Current bid gets partially paid out
      resolution.amountsPaid[sortedBids[i].id] =
        sortedBids[i].amount + unsoldPortion * valuation
      // Early return resolution data
      resolution.valuation = valuation
      return resolution
      // If all bids are exhausted but the project has enough funding, bids go through
    } else if (
      (totalFunding >= minFunding && i + 1 == sortedBids.length) ||
      (i + 1 < sortedBids.length &&
        totalFunding / sortedBids[i + 1].valuation >= 1 - founderPortion)
    ) {
      // Current bid gets fully paid out
      resolution.amountsPaid[sortedBids[i].id] = sortedBids[i].amount
      // Early return resolution data
      resolution.valuation = valuation
      return resolution
    }
    // Haven't resolved yet; if project gets funded based on later bids, current bid will fully pay out
    resolution.amountsPaid[sortedBids[i].id] = sortedBids[i].amount
    i++
  }
  // Bids are exhausted and minimum funding was not reached: reject all bids & return resolution data
  resolution.amountsPaid = Object.fromEntries(
    sortedBids.map((bid) => [bid.id, 0])
  )
  return resolution
}

async function sendAuctionCloseEmails(
  bids: BidAndProfile[],
  project: Project,
  resolution: Resolution,
  founderPortion: number
) {
  const projectUrl = `https://manifund.org/projects/${project.slug}?tab=shareholders#tabs`
  const auctionResolutionText = genAuctionResolutionText(
    bids,
    resolution,
    founderPortion
  )
  for (const bid of bids) {
    const bidResolutionText = genBidResolutionText(bid, resolution)
    const bidderPostmarkVars = {
      projectTitle: project.title,
      result: resolution.amountsPaid[bid.id] > 0 ? 'accepted' : 'declined',
      projectUrl,
      auctionResolutionText,
      bidResolutionText,
    }
    await sendTemplateEmail(
      TEMPLATE_IDS.OFFER_RESOLVED,
      bidderPostmarkVars,
      bid.bidder
    )
  }
  const creatorPostmarkVars = {
    projectTitle: project.title,
    projectUrl,
    claimFundsText:
      resolution.valuation > 0
        ? 'Withdraw your funds by going to your profile page, and clicking the [-] button where your cash balance is displayed.'
        : '',
    auctionResolutionText,
  }
  await sendTemplateEmail(
    TEMPLATE_IDS.AUCTION_RESOLVED,
    creatorPostmarkVars,
    project.creator
  )
}

function genAuctionResolutionText(
  bids: Bid[],
  resolution: Resolution,
  founderPortion: number
) {
  const totalFunding =
    resolution.valuation > 0
      ? bids.reduce(
          (total, current) => total + resolution.amountsPaid[current.id],
          0
        )
      : 0
  const portionSold = totalFunding / resolution.valuation
  if (portionSold + founderPortion >= 0.999999999999) {
    return `This project was successfully funded. Shares were sold at a valuation of 
        ${formatMoney(resolution.valuation)} and the project received
        ${formatMoney(totalFunding)} in funding.`
  } else if (totalFunding > 0) {
    return `This project was successfully funded. It received ${formatMoney(
      totalFunding
    )} in
        funding. ${formatLargeNumber(portionSold * 100)}% of shares were sold at
        a valuation of ${formatMoney(resolution.valuation)}, the founder holds
        another ${formatLargeNumber(founderPortion * 100)}%, and the remaining
        shares will be sold on the market.`
  } else {
    return `Funding unsuccessful. The project will not proceed.`
  }
}

function genBidResolutionText(bid: Bid, resolution: Resolution) {
  if (resolution.amountsPaid[bid.id] > 0) {
    return `Your bid of ${formatMoney(bid.amount)} at ${formatMoney(
      bid.valuation
    )} was accepted! You paid
        ${formatMoney(resolution.amountsPaid[bid.id])} for ${formatLargeNumber(
      (resolution.amountsPaid[bid.id] / resolution.valuation) * 100
    )}% ownership of the impact certificate.`
  } else {
    return `Your bid of ${formatMoney(bid.amount)} at ${formatMoney(
      bid.valuation
    )} was declined.`
  }
}
