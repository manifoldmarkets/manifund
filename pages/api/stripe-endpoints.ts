import Stripe from 'stripe'
import { STRIPE_SECRET_KEY, isProd } from '@/db/env'
import { createAdminClient } from './_db'
import { sendTemplateEmail } from '@/utils/email'
import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
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
    const session = event.data.object as StripeSession
    await issueMoneys(session)
    const PAYMENT_CONFIRMATION_TEMPLATE_ID = 31316115
    await sendTemplateEmail(
      session.metadata.userId,
      PAYMENT_CONFIRMATION_TEMPLATE_ID,
      {
        amount: session.metadata.dollarQuantity,
      }
    )
  }
  return res.status(200).send('success')
}

const BANK_ID = isProd()
  ? '758e68da-c37c-4a9d-a82b-f4aaedde31b9'
  : '9a3a1419-2f01-4006-b744-887faf56551d'

const issueMoneys = async (session: StripeSession) => {
  const { id: sessionId } = session
  const { userId, dollarQuantity } = session.metadata
  const deposit = Number.parseInt(dollarQuantity)
  const txnId = uuid()
  const supabase = createAdminClient()

  const { data: txn, error: e1 } = await supabase.from('txns').insert({
    id: txnId,
    amount: deposit,
    from_id: BANK_ID,
    to_id: userId,
    token: 'USD',
  })
  if (e1) {
    throw e1
  }

  const { error } = await supabase.from('stripe_txns').insert({
    session_id: sessionId,
    customer_id: userId,
    txn_id: txnId,
    amount: deposit,
  })
  if (error) {
    throw error
  }
}
