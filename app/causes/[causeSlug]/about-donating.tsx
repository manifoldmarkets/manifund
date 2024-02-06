import { getUser, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { calculateCharityBalance } from '@/utils/math'
import {
  getIncomingTxnsByUserWithDonor,
  getTxnAndProjectsByUser,
} from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { getProfileById } from '@/db/profile'
import { ExpandableDonationsHistory } from '@/components/donations-history'
import { DonateSection } from './donate-section'
import { Row } from '@/components/layout/row'
import { SignInButton } from '@/components/sign-in-button'

export async function AboutDonating(props: { fundId: string }) {
  const { fundId } = props
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const fund = await getProfileById(supabase, fundId)
  if (!fund) {
    return <div>Fund not found</div>
  }
  const fundTxns = await getIncomingTxnsByUserWithDonor(supabase, fund.id)
  const userTxns = user ? await getTxnAndProjectsByUser(supabase, user.id) : []
  const userBids = user ? await getPendingBidsByUser(supabase, user.id) : []
  const userProfile = user ? await getProfileById(supabase, user.id) : null
  const charityBalance = userProfile
    ? calculateCharityBalance(
        userTxns,
        userBids,
        userProfile.id,
        userProfile.accreditation_status
      )
    : 0
  return (
    <>
      {!user && (
        <SignInButton
          buttonText="Sign in to donate"
          className="mx-auto my-10"
        />
      )}
      <DonateSection
        userId={user?.id}
        fund={fund as Profile}
        charityBalance={charityBalance}
      />
      <ExpandableDonationsHistory donations={fundTxns} />
    </>
  )
}
