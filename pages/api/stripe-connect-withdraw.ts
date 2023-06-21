import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProfileAndBidsById } from '@/db/profile'
import { getTxnsByUser } from '@/db/txn'
import { calculateCashBalance } from '@/utils/math'
import Stripe from 'stripe'
import { BANK_ID, STRIPE_SECRET_KEY } from '@/db/env'
import uuid from 'react-uuid'
import { sendTemplateEmail } from '@/utils/email'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525 required for Stripe & lodash to work
  unstable_allowDynamic: [
    '**/node_modules/function-bind/implementation.js',
    '**/node_modules/lodash/lodash.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function handler(req: NextRequest) {
  const { amount } = await req.json()
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    console.log('no user')
    return NextResponse.error()
  }
  const profile = await getProfileAndBidsById(supabase, user.id)
  if (!profile.stripe_connect_id) {
    console.log('no stripe connect id')
    return NextResponse.error()
  }
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id)
  if (!account.payouts_enabled || !account.details_submitted) {
    console.log('no payouts enabled')
    return NextResponse.error()
  }
  const txns = await getTxnsByUser(supabase, user.id)
  const withdrawBalance = calculateCashBalance(
    txns,
    profile.bids,
    user.id,
    profile.accreditation_status
  )
  if (amount > withdrawBalance) {
    console.log('amount too high')
    return NextResponse.error()
  }
  const transfer = await stripe.transfers.create({
    amount: amount,
    currency: 'usd',
    destination: profile.stripe_connect_id,
  })
  const txnId = uuid()
  await supabase
    .from('txns')
    .insert({
      id: txnId,
      from_id: user.id,
      to_id: BANK_ID ?? '',
      amount: amount,
      token: 'USD',
      project: null,
    })
    .throwOnError()
  await supabase
    .from('stripe_txns')
    .insert({
      session_id: transfer.id,
      customer_id: user.id,
      amount: amount,
      txn_id: txnId,
    })
    .throwOnError()
  const CONFIRM_WITHDRAWAL_TEMPLATE_ID = 32048469
  const usedBank = account.external_accounts?.data[0].object === 'bank_account'
  const last4 = account.external_accounts?.data[0].last4
  const postmarkVars = {
    amount: amount,
    id: txnId,
    methodText:
      (usedBank ? 'Routing number ending in: ' : 'Card ending in: ') + last4,
    fullName: profile.full_name,
    email: user.email,
  }
  await sendTemplateEmail(
    CONFIRM_WITHDRAWAL_TEMPLATE_ID,
    postmarkVars,
    undefined,
    user.email
  )
  return NextResponse.json({ amount })
}
