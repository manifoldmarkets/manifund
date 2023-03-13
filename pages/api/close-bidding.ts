import { Database } from '@/db/database.types'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './_db'
import { Project, TOTAL_SHARES } from '@/db/project'
import { getProjectById } from '@/db/project'
import { getProfileById } from '@/db/profile'
import { getUserEmail } from '@/db/profile'
import { getBidsByProject, BidAndProfile } from '@/db/bid'

import orderBy from 'lodash/orderBy'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // use a glob to allow anything in the function-bind 3rd party module
  ],
}

type Bid = Database['public']['Tables']['bids']['Row']

type ProjectProps = {
  id: string
  minFunding: number
  founderShares: number
  creator: string
}

export default async function handler(req: NextRequest) {
  const { id, minFunding, founderShares, creator } =
    (await req.json()) as ProjectProps
  const supabase = createAdminClient()
  const bids = (await getBidsByProject(supabase, id)).filter(
    (bid) => bid.status === 'pending'
  )
  const sortedBids = orderBy(bids, 'valuation', 'desc')
  let founderPortion = founderShares / TOTAL_SHARES
  const project = await getProjectById(supabase, id)
  const resolution = resolveBids(sortedBids, minFunding, founderPortion)
  sendAuctionCloseEmails(
    sortedBids,
    project,
    resolution,
    founderShares / TOTAL_SHARES
  )
  if (resolution.valuation === -1) {
    updateProjectStage(supabase, id, 'not funded')
    updateBidsStatus(supabase, sortedBids, resolution)
    return NextResponse.json('project not funded')
  } else {
    updateProjectStage(supabase, id, 'active')
    addTxns(supabase, id, sortedBids, resolution, creator)
    updateBidsStatus(supabase, sortedBids, resolution)
    return NextResponse.json('project funded!')
  }
}

async function addTxns(
  supabase: SupabaseClient,
  projectId: string,
  bids: Bid[],
  resolution: Resolution,
  creator: string
) {
  for (let i = 0; i < bids.length + 1; i++) {
    if (resolution.amountsPaid[bids[i].id] > 0) {
      let numShares =
        (resolution.amountsPaid[bids[i].id] / resolution.valuation) *
        TOTAL_SHARES
      addTxn(supabase, creator, bids[i].bidder, numShares, projectId, projectId)
      addTxn(
        supabase,
        bids[i].bidder,
        creator,
        resolution.amountsPaid[bids[i].id],
        'USD',
        projectId
      )
    }
  }
}

async function addTxn(
  supabase: SupabaseClient,
  from_id: string,
  to_id: string,
  amount: number,
  token: string,
  project: string
) {
  let txn = {
    from_id,
    to_id,
    amount,
    token,
    project,
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error('createTxn', error)
  }
}

async function updateProjectStage(
  supabase: SupabaseClient,
  id: string,
  stage: string
) {
  const { error } = await supabase
    .from('projects')
    .update({ stage: stage })
    .eq('id', id)
  if (error) {
    console.error('updateProjectStage', error)
  }
}

async function updateBidsStatus(
  supabase: SupabaseClient,
  bids: Bid[],
  resolution: Resolution
) {
  for (let i = 0; i < bids.length + 1; i++) {
    const { error } = await supabase
      .from('bids')
      .update({
        status:
          resolution.amountsPaid[bids[i].id] > 0 ? 'accepted' : 'declined',
      })
      .eq('id', bids[i].id)
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
    console.log('unsold portion', unsoldPortion, valuation, i)
    // If all shares are sold, bids go through
    if (unsoldPortion <= 0) {
      // Current bid gets partially paid out
      resolution.amountsPaid[sortedBids[i].id] =
        sortedBids[i].amount + unsoldPortion * valuation
      resolution.valuation = valuation
      console.log('valuation in rESoLVEbIDs', resolution.valuation, valuation)
      // Early return resolution data
      return resolution
      // If all bids are exhausted but the project has enough funding, bids go through
    } else if (
      (totalFunding >= minFunding && i + 1 == sortedBids.length) ||
      (i + 1 < sortedBids.length &&
        totalFunding / sortedBids[i + 1].valuation >= 1 - founderPortion)
    ) {
      // Current bid gets fully paid out
      resolution.amountsPaid[sortedBids[i].id] = sortedBids[i].amount
      resolution.valuation = valuation
      // Early return resolution data
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
  const projectUrl = `https://manifund.org/projects/${project.slug}`
  const auctionResolutionText = genAuctionResolutionText(
    bids,
    resolution,
    founderPortion
  )
  for (let i = 0; i < bids.length; i++) {
    const bidResolutionText = genBidResolutionText(bids[i], resolution)
    await sendBidderEmail(
      auctionResolutionText,
      bidResolutionText,
      project.title,
      projectUrl,
      bids[i].bidder
    )
  }
  await sendCreatorEmail(
    auctionResolutionText,
    project.title,
    projectUrl,
    project.creator
  )
}

function genAuctionResolutionText(
  bids: Bid[],
  resolution: Resolution,
  founderPortion: number
) {
  let totalFunding = bids.reduce(
    (total, current) =>
      resolution.amountsPaid[current.id] > 0
        ? total + resolution.amountsPaid[current.id]
        : total,
    0
  )
  let portionSold = totalFunding / resolution.valuation
  if (portionSold + founderPortion >= 0.999999999999) {
    return `Funding successful! All shares were sold at a valuation of 
        ${formatMoney(resolution.valuation)} and the project recieved $
        ${formatLargeNumber(totalFunding)} in funding.`
  } else if (totalFunding > 0) {
    return `Funding successful! The project recieved ${formatMoney(
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
    return `Your bid of ${formatMoney(bid.amount)} was declined.`
  }
}

async function sendCreatorEmail(
  auctionResolutionText: string,
  projectUrl: string,
  projectTitle: string,
  creatorId: string
) {
  const supabaseAdmin = createAdminClient()
  const creatorEmail = await getUserEmail(supabaseAdmin, creatorId)
  const mailgunVars = JSON.stringify({
    projectUrl,
    auctionResolutionText,
  })
  const body = new URLSearchParams()
  body.append('from', 'Manifund <no-reply@manifund.org>')
  body.append('to', creatorEmail ?? '')
  body.append('subject', `The auction for ${projectTitle} has resolved!`)
  body.append('template', 'auction_resolution')
  body.append('h:X-Mailgun-Variables', mailgunVars)
  body.append('o:tag', 'auction_resolution')

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('api:' + process.env.MAILGUN_KEY).toString('base64'),
    },
  })
}

async function sendBidderEmail(
  auctionResolutionText: string,
  bidResolutionText: string,
  projectTitle: string,
  projectUrl: string,
  bidderId: string
) {
  const supabaseAdmin = createAdminClient()
  const bidderEmail = await getUserEmail(supabaseAdmin, bidderId)
  const mailgunVars = JSON.stringify({
    projectUrl,
    auctionResolutionText,
    bidResolutionText,
  })
  const body = new URLSearchParams()
  body.append('from', 'Manifund <no-reply@manifund.org>')
  body.append('to', bidderEmail ?? '')
  body.append('subject', `Bid on ${projectTitle} resolved`)
  body.append('template', 'bid_resolution')
  body.append('h:X-Mailgun-Variables', mailgunVars)
  body.append('o:tag', 'bid_resolution')

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('api:' + process.env.MAILGUN_KEY).toString('base64'),
    },
  })
}
