import { createServerClient } from '@/db/supabase-server'
import { WithdrawalSteps } from './withdrawal-steps'
import { getProfileById, getUser } from '@/db/profile'
import { STRIPE_SECRET_KEY } from '@/db/env'
import { calculateCashBalance } from '@/utils/math'
import Stripe from 'stripe'
import { getFullTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import Auth from '@/app/login/auth-ui'

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export const revalidate = 60

export default async function WithdrawPage() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <Auth />
  }
  const [profile, txns, bids] = await Promise.all([
    getProfileById(supabase, user.id),
    getFullTxnsByUser(supabase, user.id),
    getBidsByUser(supabase, user.id),
  ])
  if (!profile) {
    return null
  }
  const withdrawBalance = calculateCashBalance(
    txns,
    bids,
    user.id,
    profile.accreditation_status
  )
  const account = profile.stripe_connect_id
    ? await stripe.accounts.retrieve(profile.stripe_connect_id)
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
    <div className="absolute left-0 top-0 z-30 h-screen w-full bg-gray-50">
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
