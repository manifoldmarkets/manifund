import { Bid } from '@/db/bid'
import { Project } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type BidProps = {
  projectId: string
  projectStage: Project['stage']
  bidderId: string
  valuation: number
  amount: number
  type: 'buy' | 'sell'
}

export default async function handler(req: NextRequest) {
  const { projectId, projectStage, bidderId, valuation, amount, type } =
    (await req.json()) as BidProps
  const supabase = createEdgeClient(req)
  const id = uuid()
  const newBid = {
    id,
    project: projectId,
    bidder: bidderId,
    valuation,
    amount,
    status: 'pending' as Bid['status'],
    type,
  }
  const { error } = await supabase.from('bids').insert([newBid])
  if (error) {
    throw error
  }
  if (projectStage === 'active') {
    await findAndMakeTrades(newBid, supabase)
  }
}

type BidXCreatedAt = {
  id: string
  project: any
  bidder: any
  valuation: any
  amount: any
  status?: 'deleted' | 'pending' | 'accepted' | 'declined'
  type: any
}

async function findAndMakeTrades(bid: BidXCreatedAt, supabase: SupabaseClient) {
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
  let i = 0
  let budget = bid.amount
  while (budget > 0 && i < oldBids.length) {
    if (
      newOfferType === 'buy'
        ? oldBids[i].valuation > bid.valuation
        : oldBids[i].valuation < bid.valuation
    ) {
      return
    }
    const tradeAmount = Math.min(budget, oldBids[i].amount)
    budget -= tradeAmount
    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldBidId: oldBids[i].bidder,
        usdTraded: tradeAmount,
        tradePartnerId: bid.bidder,
      }),
    })
    i++
  }
}
