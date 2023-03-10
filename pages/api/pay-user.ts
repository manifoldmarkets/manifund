import { PayUserProps } from '@/app/admin/pay-user'
import { getUser, isAdmin } from '@/db/profile'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// ID for austin@manifold.markets, the official bank account
const BANK_ID = '758e68da-c37c-4a9d-a82b-f4aaedde31b9'

export default async function handler(req: NextRequest) {
  const supabaseEdge = createEdgeClient(req)
  const user = await getUser(supabaseEdge)
  if (!user || !isAdmin(user)) return Response.error()

  const { userId, amount } = (await req.json()) as PayUserProps

  const supabaseAdmin = createAdminClient()
  // Create a new txn paying this user
  const { data: txn, error } = await supabaseAdmin
    .from('txns')
    .insert({ amount, from_id: BANK_ID, to_id: userId, token: 'USD' })

  return NextResponse.json(txn)
}
