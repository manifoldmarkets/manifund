import { Bid } from '@/db/bid'
import { Database } from '@/db/database.types'
import { trade } from '@/utils/trade'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { getProjectById, Project } from '@/db/project'
import { getProfileAndBidsById, getUser } from '@/db/profile'
import { maybeActivateGrant } from '@/utils/activate-grant'
import { getTxnsByProject, getTxnsByUser } from '@/db/txn'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateFullTrades,
} from '@/utils/math'
import { calculateShareholders } from '@/app/projects/[slug]/project-tabs'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type BidProps = {
  projectId: string
  valuation: number
  amount: number
  type: Bid['type']
}

export default async function handler(req: NextRequest) {
  const { projectId, valuation, amount, type } = (await req.json()) as BidProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  const [bidder, txns, project] = await Promise.all([
    getProfileAndBidsById(supabase, user.id),
    getTxnsByUser(supabase, user.id),
    getProjectById(supabase, projectId),
  ])
  const bidderBalance =
    bidder.accreditation_status && type === 'buy'
      ? calculateCashBalance(
          txns,
          bidder.bids,
          bidder.id,
          bidder.accreditation_status
        )
      : calculateCharityBalance(
          txns,
          bidder.bids,
          bidder.id,
          bidder.accreditation_status
        )
  if (type !== 'sell' && bidderBalance < amount) {
    return new Response('Insufficient funds', { status: 401 })
  }
  if (!project) {
    return new Response('Project not found', { status: 404 })
  }
  const id = uuid()
  const newBid = {
    id,
    project: projectId,
    bidder: user.id,
    valuation,
    amount,
    status: 'pending' as Bid['status'],
    type,
  }
  await supabase.from('bids').insert([newBid]).throwOnError()
  if (type === 'donate') {
    await maybeActivateGrant(supabase, projectId)
  }
  if (project.stage === 'active') {
    if (type === 'buy') {
      await emailShareholders(
        newBid,
        bidder.full_name,
        project,
        project.creator,
        supabase
      )
    }
    await findAndMakeTrades(newBid, supabase)
  }
}

type BidInsert = Database['public']['Tables']['bids']['Insert']

async function findAndMakeTrades(bid: BidInsert, supabase: SupabaseClient) {
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

async function emailShareholders(
  bid: BidInsert,
  bidderName: string,
  project: Project,
  projectCreatorId: string,
  supabase: SupabaseClient
) {
  const projectTxns = await getTxnsByProject(supabase, bid.project)
  const trades = calculateFullTrades(projectTxns)
  const creatorProfile = trades.find(
    (trade) => trade.fromProfile.id === projectCreatorId
  )?.fromProfile
  if (!creatorProfile) {
    return
  }
  const shareholders = calculateShareholders(trades, creatorProfile)
  for (const shareholder of shareholders) {
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF,
      {
        notifText: `${bidderName} has made a ${bid.type} offer for ${Math.round(
          (bid.amount / bid.valuation) * 100
        )}% equity at a valuation of $${bid.valuation} for the project "${
          project.title
        }" on Manifund.`,
        buttonUrl: `manifund.org/projects/${project.slug}?tab=bids`,
        buttonText: 'See offer',
        subject: `New offer from ${bidderName} on "${project.title}"`,
      },
      shareholder.profile.id
    )
  }
}
