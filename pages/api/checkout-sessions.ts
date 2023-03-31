import Stripe from 'stripe'
import { NextApiRequest, NextApiResponse } from 'next'
import { STRIPE_SECRET_KEY } from '@/db/env'

const stripe = require('stripe')(STRIPE_SECRET_KEY)

export type StripeSession = Stripe.Event.Data.Object & {
  id: string
  url: string
  metadata: {
    userId: string
    manticDollarQuantity: string
  }
}

const initStripe = () => {
  const apiKey = process.env.STRIPE_APIKEY as string
  return new Stripe(apiKey, { apiVersion: '2022-11-15', typescript: true })
}

// manage at https://dashboard.stripe.com/test/products?active=true
const dollarStripePrice = {
  10: 'price_1MrnJEEsVtaUUvWWa0Z1MoEF',
}

type CheckoutProps = {
  dollarQuantity: 10
  userId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { dollarQuantity, userId } = (await req.body) as CheckoutProps
  console.log('in request')
  if (req.method === 'POST') {
    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: dollarStripePrice[dollarQuantity],
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000`,
        cancel_url: `http://localhost:3000`,
        automatic_tax: { enabled: true },
      })
      // res.redirect(303, session.url)
      res.json({ url: session.url, id: session.id })
    } catch (error: any) {
      console.log(error)
      res.status(error.statusCode || 500).json(error.message)
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
