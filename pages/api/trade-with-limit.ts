import { NextRequest, NextResponse } from 'next/server'
import { genTradeText, makeTrade, updateBidFromTrade } from '@/utils/trade'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getProfileById } from '@/db/profile'
import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'
import { createEdgeClient } from './_db'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
} from '@/utils/math'
import { getBidById, getBidsByUser } from '@/db/bid'
import { TOTAL_SHARES } from '@/db/project'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'

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
  numDollarsInTrade: number
}

export default async function handler(req: NextRequest) {
  const { oldBidId, numDollarsInTrade } = (await req.json()) as TradeProps
  const supabase = createEdgeClient(req)
  const supabaseAdmin = await createAuthorizedAdminClient()
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    console.error('no user')
    return NextResponse.error()
  }
  const [userProfile, userTxns, userBids, oldBid] = await Promise.all([
    getProfileById(supabase, user.id),
    getTxnAndProjectsByUser(supabase, user.id),
    getBidsByUser(supabase, user.id),
    getBidById(oldBidId, supabase),
  ])
  if (!userProfile) {
    console.error('no user profile')
    return NextResponse.error()
  }
  const [partnerTxns, partnerBids] = await Promise.all([
    getTxnAndProjectsByUser(supabase, oldBid.bidder),
    getBidsByUser(supabase, oldBid.bidder),
  ])
  const numSharesInTrade = (numDollarsInTrade / oldBid.valuation) * TOTAL_SHARES
  const buyerBalance =
    oldBid.type === 'sell'
      ? userProfile?.id === oldBid.projects.creator
        ? calculateCashBalance(userTxns, userBids, userProfile.id, true)
        : calculateCharityBalance(userTxns, userBids, userProfile.id, false)
      : oldBid.bidder === oldBid.projects.creator
      ? calculateCashBalance(partnerTxns, partnerBids, oldBid.bidder, true) +
        oldBid.amount
      : calculateCharityBalance(
          partnerTxns,
          partnerBids,
          oldBid.bidder,
          false
        ) + oldBid.amount
  const sellerShares =
    oldBid.type === 'sell'
      ? calculateSellableShares(
          partnerTxns,
          partnerBids,
          oldBid.project,
          oldBid.bidder
        ) + numSharesInTrade
      : calculateSellableShares(
          userTxns,
          userBids,
          oldBid.project,
          userProfile.id
        )
  if (
    buyerBalance < numDollarsInTrade ||
    numDollarsInTrade > oldBid.amount ||
    sellerShares < numSharesInTrade
  ) {
    console.error('invalid trade')
    return NextResponse.error()
  }
  await makeTrade(
    numSharesInTrade,
    numDollarsInTrade,
    oldBid.project,
    oldBid.bidder,
    user.id,
    oldBid.type === 'sell',
    supabase
  )
  await updateBidFromTrade(oldBid, numDollarsInTrade, supabaseAdmin)
  const tradeText = genTradeText(
    oldBid,
    oldBid.projects.title,
    numDollarsInTrade
  )
  await sendTemplateEmail(
    TEMPLATE_IDS.TRADE_ACCEPTED,
    {
      tradeText: tradeText,
      recipientProfileUrl: `manifund.org/${oldBid.profiles.username}`,
      bidType: oldBid.type,
      projectTitle: oldBid.projects.title,
    },
    oldBid.bidder
  )
  await supabase.rpc('follow_project', {
    project_id: oldBid.project,
    follower_id: user.id,
  })
  return NextResponse.json('success')
}
