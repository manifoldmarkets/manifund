import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin
    .from('txns')
    .update({ type: 'deposit' })
    .eq('from_id', process.env.NEXT_PUBLIC_PROD_BANK_ID ?? '')
    .eq('type', 'profile donation')
  return NextResponse.json('success')
}
