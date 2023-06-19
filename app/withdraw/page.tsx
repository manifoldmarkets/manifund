import { createServerClient } from '@/db/supabase-server'
import { WithdrawalSteps } from './withdrawal-steps'
import { getProfileAndBidsById, getUser } from '@/db/profile'
import { STRIPE_SECRET_KEY } from '@/db/env'
import { calculateUserBalance, calculateWithdrawBalance } from '@/utils/math'
import Stripe from 'stripe'
import { getFullTxnsByUser } from '@/db/txn'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export const revalidate = 0

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
  const profile = await getProfileAndBidsById(supabase, user.id)
  const txns = await getFullTxnsByUser(supabase, user.id)
  const withdrawBalance = calculateWithdrawBalance(
    txns,
    profile.bids,
    user.id,
    profile.accreditation_status
  )
  const { data } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', user.id)
    .throwOnError()
  const stripeAccountId = data ? data[0].stripe_connect_id : null
  const account = stripeAccountId
    ? await stripe.accounts.retrieve(stripeAccountId)
    : null
  const loginLink = account
    ? account.payouts_enabled && account.charges_enabled
      ? await stripe.accounts.createLoginLink(account.id)
      : await stripe.accountLinks.create({
          account: account.id,
          refresh_url: 'https://manifund.org',
          return_url: 'https://manifund.org',
          type: 'account_onboarding',
        })
    : null
  return (
    <div className="absolute top-0 left-0 z-30 h-screen w-full bg-gray-50">
      <WithdrawalSteps
        accountStatus={
          account
            ? account.charges_enabled && account.payouts_enabled
              ? 'complete'
              : 'incomplete'
            : 'nonexistent'
        }
        withdrawalMethod={account?.external_accounts?.data[0]}
        userId={user.id}
        withdrawBalance={withdrawBalance}
        loginUrl={loginLink?.url}
      />
    </div>
  )
}
