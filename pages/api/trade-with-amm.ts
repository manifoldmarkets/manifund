import { getUser } from '@/db/profile'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { getTxnAndProjectsByUser, getTxnsByUser, TxnType } from '@/db/txn'
import { createEdgeClient } from './_db'
import {
  ammSharesAtValuation,
  calculateAMMPorfolio,
  calculateBuyShares,
  calculateSellPayout,
  calculateTradeForValuation,
  calculateValuationAfterTrade,
  getTradeErrorMessage,
} from '@/utils/amm'
import { calculateCharityBalance, calculateSellableShares } from '@/utils/math'
import { Bid, getBidsByUser } from '@/db/bid'
import { getProjectById, TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { formatLargeNumber, formatMoneyPrecise } from '@/utils/formatting'
export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type TradeWithAmmProps = {
  projectId: string
  amount: number // USD for buying, shares for selling
  buying: boolean
  valuation?: number
}

export default async function handler(req: NextRequest) {
  const { projectId, amount, buying, valuation } =
    (await req.json()) as TradeWithAmmProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  const ammTxns = await getTxnsByUser(supabase, projectId)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, projectId)
  const ammSharesAtTrade = valuation
    ? ammSharesAtValuation(ammShares * ammUSD, valuation)
    : ammShares
  const ammUSDAtTrade = valuation
    ? (ammShares * ammUSD) / ammSharesAtTrade
    : ammUSD
  const numDollars = buying
    ? amount
    : calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)
  const numShares = buying
    ? calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade)
    : amount
  const userTxns = await getTxnAndProjectsByUser(supabase, user.id)
  const userBids = await getBidsByUser(supabase, user.id)
  const userSpendableFunds = buying
    ? calculateCharityBalance(userTxns, userBids, user.id, false)
    : 0
  const userSellableShares = calculateSellableShares(
    userTxns,
    userBids,
    projectId,
    user.id
  )
  const errorMessage = getTradeErrorMessage(
    numDollars,
    numShares / TOTAL_SHARES,
    buying ? 'buy' : 'sell',
    ammSharesAtTrade,
    ammUSDAtTrade,
    userSpendableFunds,
    userSellableShares,
    !!valuation,
    valuation
  )
  const project = await getProjectById(supabase, projectId)
  if (errorMessage) {
    return new Response(errorMessage, { status: 400 })
  }
  if (!valuation) {
    console.log('not a limit order')
    let amountRemaining = amount
    while (amountRemaining > 0) {
      const { data: firstBid } = await supabase
        .from('bids')
        .select('*, profiles(username)')
        .eq('project', projectId)
        .eq('status', 'pending')
        .eq('type', buying ? 'sell' : 'buy')
        .order('valuation', { ascending: buying })
        .single()
      console.log('first bid', firstBid)
      const ammTxns = await getTxnsByUser(supabase, projectId)
      const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, projectId)
      const valuationAfterTrade = calculateValuationAfterTrade(
        amount,
        ammShares,
        ammUSD,
        buying
      )
      const hitsLimitOrder =
        !!firstBid &&
        (buying
          ? firstBid.valuation < valuationAfterTrade
          : firstBid.valuation > valuationAfterTrade)
      if (hitsLimitOrder) {
        console.log('hits limit order!')
        const valuationAtLo = firstBid.valuation
        const [sharesInAmmTrade, usdInAmmTrade] = calculateTradeForValuation(
          ammShares,
          ammUSD,
          valuationAtLo
        )
        console.log(
          'about to trade with amm',
          sharesInAmmTrade,
          'shares;',
          usdInAmmTrade,
          'USD;'
        )
        await trade(
          Math.abs(sharesInAmmTrade),
          Math.abs(usdInAmmTrade),
          projectId,
          projectId,
          user.id,
          buying,
          supabase
        )
        amountRemaining -= buying
          ? Math.abs(usdInAmmTrade)
          : Math.abs(sharesInAmmTrade)
        console.log('amount remaining', amountRemaining)
        const usdInUserTrade = Math.min(
          firstBid.amount,
          buying
            ? amountRemaining
            : (amountRemaining / TOTAL_SHARES) * valuationAtLo
        )
        const sharesInUserTrade = Math.min(
          (firstBid.amount / valuationAtLo) * TOTAL_SHARES,
          buying
            ? (amountRemaining / valuationAtLo) * TOTAL_SHARES
            : amountRemaining
        )
        console.log(
          'about to trade with user',
          sharesInUserTrade,
          'shares;',
          usdInUserTrade,
          'USD;'
        )
        await trade(
          sharesInUserTrade,
          usdInUserTrade,
          projectId,
          firstBid.bidder,
          user.id,
          buying,
          supabase
        )
        await updateBidFromTrade(firstBid, usdInUserTrade, supabase)
        await sendTemplateEmail(
          TEMPLATE_IDS.TRADE_ACCEPTED,
          {
            tradeText: genTradeText(firstBid, project.title, usdInUserTrade),
            recipientProfileUrl: `manifund.org/${firstBid.profiles?.username}`,
            bidType: buying ? 'sell' : 'buy',
            projectTitle: project.title,
          },
          firstBid.bidder
        )
        amountRemaining -= buying ? usdInUserTrade : sharesInUserTrade
        console.log('amount remaining at the end of loop', amountRemaining)
      } else {
        console.log('does not hit limit order')
        const numDollars = buying
          ? amount
          : calculateSellPayout(amount, ammShares, ammUSD)
        const numShares = buying
          ? calculateBuyShares(amount, ammShares, ammUSD)
          : amount
        await trade(
          numShares,
          numDollars,
          projectId,
          projectId,
          user.id,
          buying,
          supabase
        )
        amountRemaining = 0
      }
    }
  } else {
    const bid = {
      amount: numDollars,
      bidder: user.id,
      project: projectId,
      valuation,
      type: buying ? 'buy' : 'sell',
      status: 'pending',
    } as Bid
    const { error } = await supabase.from('bids').insert([bid])
    if (error) {
      console.error(error)
      return new Response('Error', { status: 500 })
    }
  }
  console.log('DONE')
  return new Response('Success', { status: 200 })
}

async function trade(
  numShares: number,
  numDollars: number,
  projectId: string,
  tradePartnerId: string,
  userId: string,
  buying: boolean,
  supabase: SupabaseClient
) {
  const bundleId = uuid()
  const tradeType =
    tradePartnerId === projectId ? 'user to amm trade' : 'user to user trade'
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

export async function updateBidFromTrade(
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

function genTradeText(oldBid: Bid, projectTitle: string, usdTraded: number) {
  return `Your ${
    oldBid.type === 'buy' ? 'buy' : 'sell'
  } offer on "${projectTitle}" has been accepted. You ${
    oldBid.type === 'buy' ? 'bought' : 'sold'
  } ${formatLargeNumber(
    (usdTraded / oldBid.valuation) * 100
  )}% ownership for ${formatMoneyPrecise(usdTraded)}.`
}
