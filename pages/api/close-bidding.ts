import { Database } from '@/db/database.types'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './_db'
import { Project, TOTAL_SHARES } from '@/db/project'
import { getProjectById } from '@/db/project'
import { getUserEmail } from '@/db/profile'
import { getBidsForResolution, BidAndProfile } from '@/db/bid'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import uuid from 'react-uuid'

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
  const bids = (await getBidsForResolution(supabase, id)).filter(
    (bid) => bid.status === 'pending'
  )
  let founderPortion = founderShares / TOTAL_SHARES
  const project = await getProjectById(supabase, id)
  const resolution = resolveBids(bids, minFunding, founderPortion)
  sendAuctionCloseEmails(
    bids,
    project,
    resolution,
    founderShares / TOTAL_SHARES
  )
  if (resolution.valuation === -1) {
    updateProjectStage(supabase, id, 'not funded')
    updateBidsStatus(supabase, bids, resolution)
    return NextResponse.json('project not funded')
  } else {
    updateProjectStage(supabase, id, 'active')
    addTxns(supabase, id, bids, resolution, creator)
    updateBidsStatus(supabase, bids, resolution)
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
      }
      const usdTxn = {
        from_id: bid.bidder,
        to_id: creator,
        amount: actualAmountPaid,
        token: 'USD',
        project: projectId,
        bundle: txnBundle,
      }
      const { error } = await supabase.from('txns').insert([sharesTxn, usdTxn])
      if (error) {
        console.error('createTxn', error)
      }
    }
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
      resolution.valuation = valuation
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
  const projectUrl = `https://manifund.org/projects/${project.slug}?tab=shareholders#tabs`
  const auctionResolutionText = genAuctionResolutionText(
    bids,
    resolution,
    founderPortion
  )
  const claimFundsHTML = genClaimFundsHTML(resolution)
  for (const bid of bids) {
    const bidResolutionText = genBidResolutionText(bid, resolution)
    await sendBidderEmail(
      resolution.amountsPaid[bid.id] > 0,
      auctionResolutionText,
      bidResolutionText,
      project.title,
      projectUrl,
      bid.bidder
    )
  }
  await sendCreatorEmail(
    auctionResolutionText,
    claimFundsHTML,
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
  const totalFunding = bids.reduce(
    (total, current) =>
      resolution.amountsPaid[current.id] > 0
        ? total + resolution.amountsPaid[current.id]
        : total,
    0
  )
  const portionSold = totalFunding / resolution.valuation
  if (portionSold + founderPortion >= 0.999999999999) {
    return `This project was successfully funded. All shares were sold at a valuation of 
        ${formatMoney(resolution.valuation)} and the project recieved
        ${formatMoney(totalFunding)} in funding.`
  } else if (totalFunding > 0) {
    return `This project was successfully funded. It recieved ${formatMoney(
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

function genClaimFundsHTML(resolution: Resolution) {
  if (resolution.valuation > 0) {
    return `<a
    href="https://airtable.com/shrI3XFPivduhbnGa"
    target="_blank"
    style="
      box-sizing: border-box;
      display: inline-block;
      font-family: arial, helvetica, sans-serif;
      text-decoration: none;
      -webkit-text-size-adjust: none;
      text-align: center;
      color: #ffffff;
      background-color: #ea580c;
      border-radius: 4px;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      width: auto;
      max-width: 100%;
      overflow-wrap: break-word;
      word-break: break-word;
      word-wrap: break-word;
      mso-border-alt: none;
    "
  >
    <span
      style="
        display: block;
        padding: 10px 20px;
        line-height: 120%;
      "
      ><span
        style="
          font-size: 16px;
          font-weight: bold;
          line-height: 18.8px;
        "
        >Claim funds</span
      ></span
    >
  </a>`
  } else {
    return ''
  }
}

async function sendCreatorEmail(
  auctionResolutionText: string,
  claimFundsHTML: string,
  projectTitle: string,
  projectUrl: string,
  creatorId: string
) {
  const supabaseAdmin = createAdminClient()
  const creatorEmail = await getUserEmail(supabaseAdmin, creatorId)
  const mailgunVars = JSON.stringify({
    projectUrl,
    claimFundsHTML,
    auctionResolutionText,
  })
  const body = new URLSearchParams()
  body.append('from', 'Manifund <no-reply@manifund.org>')
  body.append('to', creatorEmail ?? '')
  body.append('subject', `Manifund auction for "${projectTitle}" has resolved!`)
  body.append('template', 'auction_resolution')
  body.append('h:X-Mailgun-Variables', mailgunVars)
  body.append('o:tag', 'auction_resolution')

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization: 'Basic ' + btoa('api:' + process.env.MAILGUN_KEY),
    },
  })
}

async function sendBidderEmail(
  bidSuccessful: boolean,
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
  body.append(
    'subject',
    `Manifund bid ${bidSuccessful ? 'accepted' : 'declined'}: ${projectTitle}`
  )
  body.append('template', 'bid_resolution')
  body.append('h:X-Mailgun-Variables', mailgunVars)
  body.append('o:tag', 'bid_resolution')

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization: 'Basic ' + btoa('api:' + process.env.MAILGUN_KEY),
    },
  })
}
