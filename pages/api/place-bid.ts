import { Bid } from '@/db/bid'
import { Database } from '@/db/database.types'
import { trade } from '@/utils/trade'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { getProjectById } from '@/db/project'
import { getProfileAndBidsById, getUser } from '@/db/profile'
import { maybeActivateGrant } from '@/utils/activate-grant'
import { getTxnsByUser } from '@/db/txn'
import { calculateCashBalance, calculateCharityBalance } from '@/utils/math'

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
