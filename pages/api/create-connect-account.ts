import { STRIPE_SECRET_KEY } from '@/db/env'
import { NextApiRequest, NextApiResponse } from 'next'
import { getURL } from 'next/dist/shared/lib/utils'
import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = await req.body

  const account = await stripe.accounts.create({
    type: 'express',
  })

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://manifund.org',
    return_url: 'https://manifund.org',
    type: 'account_onboarding',
  })
  res.json({ url: accountLink.url })
}
