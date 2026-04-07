import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from '@/db/edge'
import { getProfileById } from '@/db/profile'
import { getFullTxnsByUser } from '@/db/txn'
import { calculateCashBalance } from '@/utils/math'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '@/db/env'
import uuid from 'react-uuid'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { CENTS_PER_DOLLAR } from '@/utils/constants'
import { getBidsByUser } from '@/db/bid'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: ['**/node_modules/function-bind/implementation.js'],
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
    console.error('no user')
    return NextResponse.error()
  }
  const profile = await getProfileById(supabase, user.id)
  if (!profile?.stripe_connect_id) {
    console.error('no stripe connect id')
    return NextResponse.error()
  }
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id)
  if (!account.payouts_enabled || !account.details_submitted) {
    console.error('no payouts enabled')
    return NextResponse.error()
  }
  const txns = await getFullTxnsByUser(supabase, user.id)
  const bids = await getBidsByUser(supabase, user.id)
  const withdrawBalance = calculateCashBalance(txns, bids, user.id, profile.accreditation_status)
  if (dollarAmount <= 0 || dollarAmount > withdrawBalance) {
    console.log('invalid amount')
    return NextResponse.error()
  }

  // Insert the withdrawal txn BEFORE the Stripe transfer to prevent double-withdrawal.
  // If a concurrent request also inserts, the re-check below will catch it.
  const txnId = uuid()
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin
    .from('txns')
    .insert({
      id: txnId,
      from_id: user.id,
      to_id: process.env.NEXT_PUBLIC_PROD_BANK_ID ?? '',
      amount: dollarAmount,
      token: 'USD',
      project: null,
      type: 'withdraw',
    })
    .throwOnError()

  // Re-check balance after insert to detect concurrent withdrawals
  const txnsAfter = await getFullTxnsByUser(supabase, user.id)
  const bidsAfter = await getBidsByUser(supabase, user.id)
  const balanceAfter = calculateCashBalance(
    txnsAfter,
    bidsAfter,
    user.id,
    profile.accreditation_status
  )
  if (balanceAfter < 0) {
    // Concurrent withdrawal detected — roll back our txn
    await supabaseAdmin.from('txns').delete().eq('id', txnId).throwOnError()
    console.log('concurrent withdrawal detected, rolled back')
    return NextResponse.error()
  }

  let transfer
  try {
    transfer = await stripe.transfers.create({
      amount: dollarAmount * CENTS_PER_DOLLAR,
      currency: 'usd',
      destination: profile.stripe_connect_id,
    })
  } catch (e) {
    // Stripe transfer failed — roll back the txn
    await supabaseAdmin.from('txns').delete().eq('id', txnId).throwOnError()
    console.error('stripe transfer failed', e)
    return NextResponse.error()
  }

  await supabaseAdmin
    .from('stripe_txns')
    .insert({
      session_id: transfer.id,
      customer_id: user.id,
      amount: dollarAmount,
      txn_id: txnId,
    })
    .throwOnError()
  const usedBank = account.external_accounts?.data[0].object === 'bank_account'
  const last4 = account.external_accounts?.data[0].last4
  const postmarkVars = {
    amount: dollarAmount,
    id: txnId,
    methodText: (usedBank ? 'Routing number ending in: ' : 'Card ending in: ') + last4,
    fullName: profile.full_name,
    email: user.email,
  }
  await sendTemplateEmail(TEMPLATE_IDS.CONFIRM_WITHDRAWAL, postmarkVars, undefined, user.email)
  return NextResponse.json({ dollarAmount })
}
