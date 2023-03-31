import Stripe from 'stripe'
import { STRIPE_SECRET_KEY, isProd } from '@/db/env'
import { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from './_db'

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
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.body.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOKSECRET as string
    )
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as StripeSession
    await issueMoneys(session)
  }
  res.status(200).send('success')
}

const issueMoneys = async (session: StripeSession) => {
  const { id: sessionId } = session
  const { userId, dollarQuantity } = session.metadata
  const deposit = Number.parseInt(dollarQuantity)
  const supabase = createAdminClient()

  await fetch('/api/pay-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, amount: deposit }),
  })

  const { error } = await supabase.from('stripe_txns').insert({
    session_id: sessionId,
    customer_id: userId,
    amount: deposit,
  })
  if (error) {
    throw error
  }
}
