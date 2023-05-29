import { STRIPE_SECRET_KEY } from '@/db/env'
import { getUserEmail } from '@/utils/email'
import { NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createAdminClient } from './_db'
import { getUser } from '@/db/profile'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function handler(res: NextApiResponse) {
  const supabase = createAdminClient()
  const user = await getUser(supabase)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const userEmail = await getUserEmail(supabase, user.id)

  const account = await stripe.accounts.create({
    type: 'express',
    email: userEmail,
  })

  await supabase
    .from('profiles')
    .update({ stripe_connect_id: account.id })
    .eq('id', user.id)

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://manifund.org',
    return_url: 'https://manifund.org',
    type: 'account_onboarding',
  })
  res.json({ url: accountLink.url })
}
