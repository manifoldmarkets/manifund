import { NextResponse } from 'next/server'
import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  const supabaseAdmin = await createAuthorizedAdminClient()
  await supabaseAdmin
    .from('txns')
    .update({ type: 'deposit' })
    .eq('from_id', process.env.NEXT_PUBLIC_PROD_BANK_ID ?? '')
    .eq('type', 'profile donation')
  return NextResponse.json('success')
}
