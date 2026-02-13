import { SupabaseClient } from '@supabase/supabase-js'
import { Bid } from '@/db/bid'
import { formatLargeNumber, formatMoneyPrecise } from './formatting'
import uuid from 'react-uuid'
import { TxnType } from '@/db/txn'

export async function makeTrade(
  numShares: number,
  numDollars: number,
  projectId: string,
  tradePartnerId: string,
  userId: string,
  buying: boolean,
  supabase: SupabaseClient
) {
  const bundleId = uuid()
  const tradeType = tradePartnerId === projectId ? 'user to amm trade' : 'user to user trade'
  const sharesTxn = {
    amount: numShares,
    from_id: buying ? tradePartnerId : userId,
    to_id: buying ? userId : tradePartnerId,
    token: projectId,
    project: projectId,
    bundle: bundleId,
    type: tradeType as TxnType,
  }
  const usdTxn = {
    amount: numDollars,
    from_id: buying ? userId : tradePartnerId,
    to_id: buying ? tradePartnerId : userId,
    token: 'USD',
    project: projectId,
    bundle: bundleId,
    type: tradeType as TxnType,
  }
  const { error } = await supabase.from('txns').insert([sharesTxn, usdTxn])
  if (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export async function updateBidFromTrade(bid: Bid, amountTraded: number, supabase: SupabaseClient) {
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

export function genTradeText(oldBid: Bid, projectTitle: string, usdTraded: number) {
  return `Your ${
    oldBid.type === 'buy' ? 'buy' : 'sell'
  } offer on "${projectTitle}" has been accepted. You ${
    oldBid.type === 'buy' ? 'bought' : 'sold'
  } ${formatLargeNumber(
    (usdTraded / oldBid.valuation) * 100
  )}% ownership for ${formatMoneyPrecise(usdTraded)}.`
}
