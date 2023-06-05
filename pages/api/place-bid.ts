import { Bid, getBidsByProject } from '@/db/bid'
import { Database } from '@/db/database.types'
import { Project } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { getProjectById } from '@/db/project'
import { checkGrantFundingReady } from '@/utils/checks'
import { getUser } from '@/db/profile'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
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
  const project = await getProjectById(supabase, projectId)
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
    const bids = await getBidsByProject(supabase, projectId)
    if (checkGrantFundingReady(project, bids)) {
      await fetch('/api/activate-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: projectId }),
      })
    }
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
    await fetch('/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldBidId: oldBid.bidder,
        usdTraded: tradeAmount,
        tradePartnerId: bid.bidder,
      }),
    })
  }
}
