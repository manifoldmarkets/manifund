import { Bid } from '@/db/bid'
import { Database } from '@/db/database.types'
import { Project } from '@/db/project'
import { trade } from '@/utils/trade'
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
