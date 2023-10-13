import { getUser } from '@/db/profile'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { getTxnsByUser } from '@/db/txn'
import { createEdgeClient } from './_db'
import {
  ammSharesAtValuation,
  calculateAMMPorfolio,
  calculateBuyShares,
  calculateSellPayout,
} from '@/app/projects/[slug]/trade'
import { calculateCharityBalance, calculateSellableShares } from '@/utils/math'
import { getBidsByUser } from '@/db/bid'
import { Database } from '@/db/database.types'
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
  if (buying && amount >= ammShares) {
    return new Response('Not enough shares to sell', { status: 400 })
  }
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
  const userTxns = await getTxnsByUser(supabase, user.id)
  const userBids = await getBidsByUser(supabase, user.id)
  const userBalance = buying
    ? calculateCharityBalance(userTxns, userBids, user.id, false)
    : 0
  const userSellableShares = calculateSellableShares(
    userTxns,
    userBids,
    projectId,
    user.id
  )
  if (buying ? numDollars > userBalance : numShares > userSellableShares) {
    return new Response('Not enough in portfolio to make this trade', {
      status: 400,
    })
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
    }
    const usdTxn = {
      amount: numDollars,
      from_id: buying ? user.id : projectId,
      to_id: buying ? projectId : user.id,
      token: 'USD',
      project: projectId,
      bundle: bundleId,
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
    } as Database['public']['Tables']['bids']['Row']
    const { error } = await supabase.from('bids').insert([bid])
    if (error) {
      console.error(error)
      return new Response('Error', { status: 500 })
    }
  }

  return new Response('Success', { status: 200 })
}
