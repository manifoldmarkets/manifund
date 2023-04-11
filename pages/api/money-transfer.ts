import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// May add optional project field for regrantors later
type MoneyTransferProps = {
  fromId: string
  toId: string
  amount: number
}

export default async function handler(req: NextRequest) {
  const { fromId, toId, amount } = (await req.json()) as MoneyTransferProps
  console.log('in handler')
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  console.log(user?.id)
  console.log('from', fromId)
  // Only initiate transfers from the account currently logged in
  if (user?.id !== fromId) {
    console.log('user id mismatch')
    return NextResponse.error()
  }
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('txns').insert({
    from_id: fromId,
    to_id: toId,
    amount: amount,
    token: 'USD',
  })
  if (error) {
    console.log(error)
    return NextResponse.error()
  } else {
    return NextResponse.json('success')
  }
}
