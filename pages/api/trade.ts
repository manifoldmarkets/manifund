import { Bid, getBidById } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { devNull } from 'os'
import { createAdminClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export type TradeProps = {
  oldBidId: string
  usdTraded: number
  tradePartnerId: string
  newBidId?: string
}

export default async function handler(req: NextRequest) {
  const { oldBidId, usdTraded, newBidId, tradePartnerId } =
    (await req.json()) as TradeProps
  const supabase = createAdminClient()
  const oldBid = await getBidById(oldBidId, supabase)
  const newBid = newBidId ? await getBidById(newBidId, supabase) : null
  const addSharesTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount: (usdTraded / oldBid.valuation) * TOTAL_SHARES,
      from_id: oldBid.type === 'buy' ? tradePartnerId : oldBid.bidder,
      to_id: oldBid.type === 'buy' ? oldBid.bidder : tradePartnerId,
      project: oldBid.project,
      token: oldBid.project,
    })
    if (error) {
      throw error
    }
  }
  addSharesTxn()
  const addUSDTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount: usdTraded,
      from_id: oldBid.type === 'buy' ? oldBid.bidder : tradePartnerId,
      to_id: oldBid.type === 'buy' ? tradePartnerId : oldBid.bidder,
      project: oldBid.project,
      token: 'USD',
    })
    if (error) {
      throw error
    }
  }
  addUSDTxn()
  updateBidOnTrade(oldBid, usdTraded, supabase)
  if (newBid) {
    updateBidOnTrade(newBid, usdTraded, supabase)
  }
  return NextResponse.json({ success: true })
}

export async function updateBidOnTrade(
  bid: Bid,
  amountTraded: number,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from('bids')
    .update({
      amount: bid.amount - amountTraded,
      // May have issues with floating point arithmetic errors
      status: bid.amount === amountTraded ? 'accepted' : 'pending',
    })
    .eq('id', bid.id)
  if (error) {
    throw error
  }
}
