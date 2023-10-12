import { SupabaseClient } from '@supabase/supabase-js'
import { getUser } from '@/db/profile'
import { NextRequest } from 'next/server'
import uuid from 'react-uuid'
import { getTxnsByUser } from '@/db/txn'
import { createEdgeClient } from './_db'
import { calculateAMMPorfolio } from '@/app/projects/[slug]/trade'
import { calculateCharityBalance, calculateUserBalance } from '@/utils/math'
import { getBidsByUser } from '@/db/bid'

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
  numShares: number
}

export default async function handler(req: NextRequest) {
  const { projectId, numShares } = (await req.json()) as TradeWithAmmProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  const ammTxns = await getTxnsByUser(supabase, projectId)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, projectId)
  if (numShares >= ammShares) {
    return new Response('Not enough shares to sell', { status: 400 })
  }
  const price = (ammUSD * ammShares) / (ammShares - numShares) - ammUSD
  const userTxns = await getTxnsByUser(supabase, user.id)
  const userBids = await getBidsByUser(supabase, user.id)
  const userBalance = calculateCharityBalance(
    userTxns,
    userBids,
    user.id,
    false
  )
  if (price > userBalance) {
    return new Response('Not enough funds to buy', { status: 400 })
  }
  const bundleId = uuid()
  const sharesTxn = {
    amount: numShares,
    from_id: projectId,
    to_id: user.id,
    token: projectId,
    project: projectId,
    bundle: bundleId,
  }
  const usdTxn = {
    amount: price,
    from_id: user.id,
    to_id: projectId,
    token: 'USD',
    project: projectId,
    bundle: bundleId,
  }
  const { error } = await supabase.from('txns').insert([sharesTxn, usdTxn])
  if (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
  return new Response('Success', { status: 200 })
}
