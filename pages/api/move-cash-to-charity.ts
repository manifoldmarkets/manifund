import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { getTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { calculateCashBalance } from '@/utils/math'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import uuid from 'react-uuid'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  const { amount } = (await req.json()) as { amount: number }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  const profile = await getProfileById(supabase, user?.id)
  if (!profile || !user) {
    return NextResponse.error()
  }
  const txns = await getTxnsByUser(supabase, user?.id ?? '')
  const bids = await getBidsByUser(supabase, user?.id ?? '')
  const userCashBalance = calculateCashBalance(
    txns,
    bids,
    user.id,
    profile.accreditation_status
  )
  if (amount > userCashBalance) {
    return NextResponse.error()
  }
  const txnId = uuid()
  const { error } = await supabase.from('txns').insert({
    id: txnId,
    from_id: user.id,
    to_id: user.id,
    amount: amount,
    token: 'USD',
    type: 'cash to charity transfer',
  })
  const postmarkVars = {
    amount: amount,
    name: profile.full_name,
    email: user.email,
    txnId: txnId,
  }
  await sendTemplateEmail(
    TEMPLATE_IDS.CASH_TO_CHARITY,
    postmarkVars,
    profile.id
  )
  if (error) {
    return NextResponse.error()
  } else {
    return NextResponse.json('success')
  }
}
