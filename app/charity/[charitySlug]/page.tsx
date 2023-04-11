import { createServerClient } from '@/db/supabase-server'
import { getProfileByUsername, getProfileById, getUser } from '@/db/profile'
import { getIncomingTxnsByUser, getOutgoingTxnsByUser } from '@/db/txn'
import { DonateBox } from './donate-box'
import { calculateUserSpendableFunds } from '@/utils/math'
import { getBidsByUser } from '@/db/bid'

export default async function CharityPage(props: {
  params: { charitySlug: string }
}) {
  const { charitySlug } = props.params
  const supabase = createServerClient()
  const charity = await getProfileByUsername(supabase, charitySlug)
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const incomingUserTxns = await getIncomingTxnsByUser(
    supabase,
    user?.id as string
  )
  const outgoingUserTxns = await getOutgoingTxnsByUser(
    supabase,
    user?.id as string
  )
  const bids = await getBidsByUser(supabase, user?.id as string)
  const userSpendableFunds = calculateUserSpendableFunds(
    incomingUserTxns,
    outgoingUserTxns,
    bids,
    profile?.accreditation_status as boolean
  )
  return (
    <div>
      <h1 className="text-2xl font-bold">{charity.full_name}</h1>
      {profile && (
        <DonateBox
          charity={charity}
          user={profile}
          userSpendableFunds={userSpendableFunds}
        />
      )}
    </div>
  )
}
