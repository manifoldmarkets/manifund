import { NextRequest, NextResponse } from 'next/server'
import { trade } from '@/utils/trade'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getProfileById } from '@/db/profile'
import { createEdgeClient } from './_db'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
} from '@/utils/math'
import { getBidById, getBidsByUser } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export type TradeProps = {
  oldBidId: string
  usdTraded: number
  newBidId?: string
}

export default async function handler(req: NextRequest) {
  const { oldBidId, usdTraded, newBidId } = (await req.json()) as TradeProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    return NextResponse.error()
  }
  const [profile, txns, bids, oldBid] = await Promise.all([
    getProfileById(supabase, user.id),
    getTxnAndProjectsByUser(supabase, user.id),
    getBidsByUser(supabase, user.id),
    getBidById(oldBidId, supabase),
  ])
  if (!profile) {
    return NextResponse.error()
  }
  if (oldBid.type === 'sell') {
    // TODO: instead of acc investors trading with cash, project creators trade with cash
    const balance = profile?.accreditation_status
      ? calculateCashBalance(txns, bids, profile.id, true)
      : calculateCharityBalance(txns, bids, profile.id, false)
    if (balance < usdTraded) {
      return NextResponse.error()
    }
  } else if (oldBid.type === 'buy') {
    const currentShares = calculateSellableShares(
      txns,
      bids,
      oldBid.project,
      profile.id
    )
    const tradedShares = (usdTraded / oldBid.valuation) * TOTAL_SHARES
    if (currentShares < tradedShares) {
      return NextResponse.error()
    }
  } else {
    return NextResponse.error()
  }
  await trade(oldBidId, usdTraded, user.id, newBidId)
  return NextResponse.json({ success: true })
}
