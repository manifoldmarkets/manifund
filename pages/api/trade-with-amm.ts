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
import { Bid, getBidsByProject, getBidsByUser } from '@/db/bid'
import { Database } from '@/db/database.types'
import { TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { orderBy } from 'lodash'
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
  if (errorMessage) {
    return new Response(errorMessage, { status: 400 })
  }
  if (!valuation) {
    const bundleId = uuid()
    const sharesTxn = {
      amount: numShares,
      from_id: buying ? projectId : user.id,
      to_id: buying ? user.id : projectId,
      token: projectId,
      project: projectId,
      bundle: bundleId,
      type: 'user to amm trade' as TxnType,
    }
    const usdTxn = {
      amount: numDollars,
      from_id: buying ? user.id : projectId,
      to_id: buying ? projectId : user.id,
      token: 'USD',
      project: projectId,
      bundle: bundleId,
      type: 'user to amm trade' as TxnType,
    }
    const { error } = await supabase.from('txns').insert([sharesTxn, usdTxn])
    if (error) {
      console.error(error)
      return new Response('Error', { status: 500 })
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

  return new Response('Success', { status: 200 })
}

async function handleAmmTrade(
  projectId: string,
  userId: string,
  amount: number,
  buying: boolean,
  supabase: SupabaseClient
) {
  let amountRemaining = amount
  while (amountRemaining > 0) {
    const projectBids = await getBidsByProject(supabase, projectId)
    const tradeableBids = projectBids.filter(
      (bid) =>
        bid.status === 'pending' && bid.type === (buying ? 'sell' : 'buy')
    )
    const sortedBids = orderBy(
      tradeableBids,
      'valuation',
      buying ? 'asc' : 'desc'
    )
    const ammTxns = await getTxnsByUser(supabase, projectId)
    const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, projectId)
    const valuationAfterTrade = calculateValuationAfterTrade(
      amount,
      ammShares,
      ammUSD,
      buying
    )
    const hitsLimitOrder =
      !!sortedBids[0] && buying
        ? sortedBids[0].valuation < valuationAfterTrade
        : sortedBids[0].valuation > valuationAfterTrade
    if (hitsLimitOrder) {
      const valuationAtLo = sortedBids[0].valuation
      const [sharesInAmmTrade, usdInAmmTrade] = calculateTradeForValuation(
        ammShares,
        ammUSD,
        valuationAtLo
      )
      await trade(
        Math.abs(sharesInAmmTrade),
        Math.abs(usdInAmmTrade),
        projectId,
        projectId,
        userId,
        buying,
        supabase
      )
      amountRemaining -= buying ? usdInAmmTrade : sharesInAmmTrade
      const usdInUserTrade = Math.min(
        sortedBids[0].amount,
        buying
          ? amountRemaining
          : (amountRemaining / TOTAL_SHARES) * valuationAtLo
      )
      const sharesInUserTrade = calculateBuyShares(
        usdInUserTrade,
        ammShares,
        ammUSD
      )
      await trade(
        sharesInUserTrade,
        sharesInAmmTrade,
        projectId,
        sortedBids[0].bidder,
        userId,
        buying,
        supabase
      )
      amountRemaining -= buying ? usdInUserTrade : sharesInUserTrade
    } else {
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
        userId,
        buying,
        supabase
      )
      amountRemaining = 0
    }
  }
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
    tradePartnerId === projectId ? 'user to user trade' : 'user to amm trade'
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
}
