import { NextRequest, NextResponse } from 'next/server'
import { trade } from '@/utils/trade'

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
  await trade(oldBidId, usdTraded, tradePartnerId, newBidId)
  return NextResponse.json({ success: true })
}
