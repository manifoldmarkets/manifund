import { TOTAL_SHARES } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export type TradeProps = {
  buyer: string
  seller: string
  amount: number
  valuation: number
  projectId: string
}

export default async function handler(req: NextRequest) {
  const { buyer, seller, amount, valuation, projectId } =
    (await req.json()) as TradeProps
  const supabase = createAdminClient()
  const addSharesTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount: (amount / valuation) * TOTAL_SHARES,
      from_id: seller,
      to_id: buyer,
      project: projectId,
      token: projectId,
    })
    if (error) {
      throw error
    }
  }
  addSharesTxn()
  const addUSDTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount,
      from_id: buyer,
      to_id: seller,
      project: projectId,
      token: 'USD',
    })
    if (error) {
      throw error
    }
  }
  addUSDTxn()
  return NextResponse.json({ success: true })
}
