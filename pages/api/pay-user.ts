import { PayUserProps } from '@/app/admin/pay-user'
import { getUser, isAdmin } from '@/db/profile'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const supabaseEdge = createEdgeClient(req)
  const user = await getUser(supabaseEdge)
  if (!user || !isAdmin(user)) return Response.error()

  const { userId, amount } = (await req.json()) as PayUserProps
  // Interpret negative amounts as payments to the bank
  const positiveAmount = Math.abs(amount)
  const from_id =
    amount > 0 ? (process.env.NEXT_PUBLIC_PROD_BANK_ID as string) : userId
  const to_id =
    amount > 0 ? userId : (process.env.NEXT_PUBLIC_PROD_BANK_ID as string)

  const supabaseAdmin = createAdminClient()
  // Create a new txn paying this user
  const { data: txn, error } = await supabaseAdmin
    .from('txns')
    .insert({
      amount: positiveAmount,
      from_id,
      to_id,
      token: 'USD',
      type: amount > 0 ? 'deposit' : 'withdraw',
    })
  return NextResponse.json(txn)
}
