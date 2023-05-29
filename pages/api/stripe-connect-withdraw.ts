import { getProfileAndBidsById } from '@/db/profile'
import { getFullTxnsByUser } from '@/db/txn'
import { calculateUserBalance, calculateWithdrawBalance } from '@/utils/math'
import Stripe from 'stripe'
import { BANK_ID, STRIPE_SECRET_KEY } from '@/db/env'
import uuid from 'react-uuid'
import { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@/db/supabase-server'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { amount } = await req.body
  const supabase = createServerClient()
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    {
      return res.status(401).json({ error: 'No user' })
    }
  }
  const profile = await getProfileAndBidsById(supabase, user.id)
  if (!profile.stripe_connect_id) {
    return res.status(401).json({ error: 'No stripe connect id' })
  }
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id)
  if (!account.payouts_enabled || !account.details_submitted) {
    return res.status(401).json({ error: 'Payouts not enabled' })
  }
  const txns = await getFullTxnsByUser(supabase, user.id)
  const balance = calculateUserBalance(txns, user.id)
  const withdrawBalance = calculateWithdrawBalance(
    txns,
    profile.bids,
    user.id,
    balance,
    profile.accreditation_status
  )
  if (amount > withdrawBalance) {
    return res.status(401).json({ error: 'Insufficient funds' })
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
  return res.status(200).json({ success: true })
}
