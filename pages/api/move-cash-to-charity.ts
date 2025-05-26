import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
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
  if (amount < 1) {
    // This also prevents negative withdraws
    console.error('amount must be $1 or greater')
    return NextResponse.error()
  }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  const profile = await getProfileById(supabase, user?.id)
  if (!profile || !user) {
    console.error('no user or profile')
    return NextResponse.error()
  }
  const txns = await getTxnAndProjectsByUser(supabase, user.id)
  const bids = await getPendingBidsByUser(supabase, user.id)
  const cashBalance = calculateCashBalance(
    txns,
    bids,
    user.id,
    profile.accreditation_status
  )
  if (amount > cashBalance) {
    console.error('amount too high')
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
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  const postmarkVars = {
    amount: amount,
    name: profile.full_name,
    email: user.email,
    txnId: txnId,
  }
  await sendTemplateEmail(
    TEMPLATE_IDS.CASH_TO_CHARITY,
    postmarkVars,
    undefined,
    user.email
  )
  return NextResponse.json('success')
}
