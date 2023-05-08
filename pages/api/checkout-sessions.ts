import Stripe from 'stripe'
import { NextApiRequest, NextApiResponse } from 'next'
import { isProd, STRIPE_SECRET_KEY } from '@/db/env'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export type StripeSession = Stripe.Event.Data.Object & {
  id: string
  url: string
  metadata: {
    userId: string
    dollarQuantity: string
  }
}

type CheckoutProps = {
  dollarQuantity: number
  userId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { dollarQuantity, userId } = (await req.body) as CheckoutProps
  const amountToCharge = dollarQuantity * 100
  if (req.method === 'POST') {
    try {
      const session = await stripe.checkout.sessions.create({
        metadata: {
          userId,
          dollarQuantity,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: amountToCharge,
              product: isProd() ? 'prod_NqCUvVOuGcx6jo' : 'prod_NqCWEno6lHiydK',
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: isProd()
          ? 'https://manifund.org'
          : 'http://localhost:3000',
        cancel_url: isProd() ? 'https://manifund.org' : 'http://localhost:3000',
      })
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
