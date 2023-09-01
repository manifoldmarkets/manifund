import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProfileAndBidsById } from '@/db/profile'
import { getFullTxnsByUser } from '@/db/txn'
import { calculateCashBalance } from '@/utils/math'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '@/db/env'
import uuid from 'react-uuid'
import { sendTemplateEmail } from '@/utils/email'
import { CENTS_PER_DOLLAR } from '@/utils/constants'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525 required for Stripe & lodash to work
  unstable_allowDynamic: [
    '**/node_modules/function-bind/implementation.js',
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function handler(req: NextRequest) {
  const { dollarAmount } = await req.json()
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
  const txns = await getFullTxnsByUser(supabase, user.id)
  const withdrawBalance = calculateCashBalance(
    txns,
    profile.bids,
    user.id,
    profile.accreditation_status
  )
  if (dollarAmount > withdrawBalance) {
    console.log('amount too high')
    return NextResponse.error()
  }
  const transfer = await stripe.transfers.create({
    amount: dollarAmount * CENTS_PER_DOLLAR,
    currency: 'usd',
    destination: profile.stripe_connect_id,
  })
  const txnId = uuid()
  await supabase
    .from('txns')
    .insert({
      id: txnId,
      from_id: user.id,
      to_id: process.env.NEXT_PUBLIC_PROD_BANK_ID ?? '',
      amount: dollarAmount,
      token: 'USD',
      project: null,
    })
    .throwOnError()
  await supabase
    .from('stripe_txns')
    .insert({
      session_id: transfer.id,
      customer_id: user.id,
      amount: dollarAmount,
      txn_id: txnId,
    })
    .throwOnError()
  const CONFIRM_WITHDRAWAL_TEMPLATE_ID = 32048469
  const usedBank = account.external_accounts?.data[0].object === 'bank_account'
  const last4 = account.external_accounts?.data[0].last4
  const postmarkVars = {
    amount: dollarAmount,
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
  return NextResponse.json({ dollarAmount })
}
