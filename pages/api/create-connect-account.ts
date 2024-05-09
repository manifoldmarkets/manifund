import { STRIPE_SECRET_KEY } from '@/db/env'
import Stripe from 'stripe'
import { createEdgeClient } from './_db'
import { getUser } from '@/db/profile'
import { NextRequest, NextResponse } from 'next/server'
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
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return NextResponse.error()
  }
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    // Set recipient agreement type to support cross-border payouts
    // See: https://docs.stripe.com/connect/service-agreement-types
    tos_acceptance: {
      service_agreement: 'recipient',
    },
  })
  await supabase
    .from('profiles')
    .update({ stripe_connect_id: account.id })
    .eq('id', user.id)
    .throwOnError()
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://manifund.org/withdraw',
    return_url: 'https://manifund.org/withdraw',
    type: 'account_onboarding',
  })
  if (!accountLink) {
    console.log('no account link')
    return NextResponse.error()
  }
  return NextResponse.json({ url: accountLink.url })
}
