import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '@/db/env'
import { createAdminClient } from './_db'
import { sendTemplateEmail } from '@/utils/email'
import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
import { BANK_ID } from '@/db/env'
import uuid from 'react-uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export type StripeSession = Stripe.Event.Data.Object & {
  id: string
  metadata: {
    userId: string
    dollarQuantity: string
  }
}

const initStripe = () => {
  const apiKey = STRIPE_SECRET_KEY as string
  return new Stripe(apiKey, { apiVersion: '2022-11-15', typescript: true })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = initStripe()
  const buf = await buffer(req)
  let event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      req.headers['stripe-signature'] as string,
      // Update to CLI var in dev
      process.env.STRIPE_WEBHOOKSECRET as string
    )
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    console.log(event)
    const session = event.data.object as Stripe.Checkout.Session
    const txnId = uuid()
    await issueMoneys(session, txnId)
    const PAYMENT_CONFIRMATION_TEMPLATE_ID = 31316115
    await sendTemplateEmail(
      PAYMENT_CONFIRMATION_TEMPLATE_ID,
      {
        amount: session.metadata?.dollarQuantity,
        id: txnId,
        fullName: session.customer_details?.name,
        email: session.customer_details?.email,
      },
      session.metadata?.userId
    )
  }
  return res.status(200).send('success')
}

const issueMoneys = async (session: Stripe.Checkout.Session, txnId: string) => {
  const { id: sessionId } = session
  const { userId, dollarQuantity } = session.metadata ?? {}
  const deposit = Number.parseInt(dollarQuantity)
  const supabase = createAdminClient()
  // TODO: make this an RPC
  await supabase
    .from('txns')
    .insert({
      id: txnId,
      amount: deposit,
      from_id: BANK_ID,
      to_id: userId,
      token: 'USD',
    })
    .throwOnError()
  await supabase
    .from('stripe_txns')
    .insert({
      session_id: sessionId,
      customer_id: userId,
      txn_id: txnId,
      amount: deposit,
    })
    .throwOnError()
}
