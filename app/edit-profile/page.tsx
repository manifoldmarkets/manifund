import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById } from '@/db/profile'
import { EditProfileForm } from './edit-profile'
import { Stripe } from 'stripe'
import { STRIPE_SECRET_KEY } from '@/db/env'

export const revalidate = 0

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})

export default async function Page() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>You are not logged in.</div>
  }
  const profile = await getProfileById(supabase, user?.id)
  if (!profile) {
    return <div>No profile found.</div>
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
  const loginLink = stripeAccountId
    ? await stripe.accounts.createLoginLink(stripeAccountId)
    : null
  return <EditProfileForm profile={profile} />
}
