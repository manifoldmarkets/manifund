import { createServerClient } from '@/db/supabase-server'
import { WithdrawalSteps } from './withdrawal-steps'
import { getUser } from '@/db/profile'
import { STRIPE_SECRET_KEY } from '@/db/env'
import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function WithdrawPage() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return (
      <div>
        You are not logged in. Please log in to withdraw funds from your
        account.
      </div>
    )
  }
  const { data } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', user.id)
    .throwOnError()
  const stripeAccountId = data ? data[0].stripe_connect_id : null
  const account = stripeAccountId
    ? await stripe.accounts.retrieve(stripeAccountId)
    : null
  // console.log('account', account)
  // console.log('bank details', account?.external_accounts?.data[0])
  return (
    <div className="absolute top-0 left-0 z-30 h-screen w-full bg-gray-50">
      <WithdrawalSteps account={account} userId={user.id} />
    </div>
  )
}
