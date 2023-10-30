import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import { Bid, FullBid, getBidById } from '@/db/bid'
import { formatLargeNumber, formatMoney } from './formatting'
import { NextResponse } from 'next/server'
import { sendTemplateEmail, TEMPLATE_IDS } from './email'
import { getProfileById } from '@/db/profile'
import uuid from 'react-uuid'
import { TOTAL_SHARES } from '@/db/project'

export async function trade(
  oldBidId: string,
  usdTraded: number,
  tradePartnerId: string,
  newBidId?: string
) {
  const supabase = createAdminClient()
  const oldBid = await getBidById(oldBidId, supabase)
  const newBid = newBidId ? await getBidById(newBidId, supabase) : null
  const tradePartner = newBid
    ? newBid.profiles
    : await getProfileById(supabase, tradePartnerId)
  const bundle = uuid()
  // TODO: turn into rpc
  await supabase
    .from('txns')
    .insert({
      amount: (usdTraded / oldBid.valuation) * TOTAL_SHARES,
      from_id: oldBid.type === 'buy' ? tradePartnerId : oldBid.bidder,
      to_id: oldBid.type === 'buy' ? oldBid.bidder : tradePartnerId,
      project: oldBid.project,
      token: oldBid.project,
      bundle,
    })
    .throwOnError()
  await supabase
    .from('txns')
    .insert({
      amount: usdTraded,
      from_id: oldBid.type === 'buy' ? oldBid.bidder : tradePartnerId,
      to_id: oldBid.type === 'buy' ? tradePartnerId : oldBid.bidder,
      project: oldBid.project,
      token: 'USD',
      bundle,
    })
    .throwOnError()
  await updateBidOnTrade(oldBid, usdTraded, supabase)
  if (newBid) {
    await updateBidOnTrade(newBid, usdTraded, supabase)
  }
  const tradeText = genTradeText(
    oldBid,
    usdTraded,
    tradePartner?.username ?? ''
  )
  await sendTemplateEmail(
    TEMPLATE_IDS.TRADE_ACCEPTED,
    {
      tradeText: tradeText,
      recipientProfileUrl: `manifund.org/${oldBid.profiles.username}`,
      bidType: oldBid.type === 'buy' ? 'buy' : 'sell',
      projectTitle: oldBid.projects.title,
    },
    oldBid.bidder
  )
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

function genTradeText(
  oldBid: FullBid,
  usdTraded: number,
  tradePartnerUsername: string
) {
  return `${tradePartnerUsername} has accepted your ${
    oldBid.type === 'buy' ? 'buy' : 'sell'
  } offer on "${oldBid.projects.title}". You ${
    oldBid.type === 'buy' ? 'bought' : 'sold'
  } ${formatLargeNumber(
    (usdTraded / oldBid.valuation) * 100
  )}% ownership for ${formatMoney(usdTraded)}.`
}
