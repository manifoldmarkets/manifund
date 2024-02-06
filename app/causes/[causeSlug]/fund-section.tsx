import { getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { calculateCharityBalance } from '@/utils/math'
import {
  getIncomingTxnsByUserWithDonor,
  getTxnAndProjectsByUser,
} from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { getProfileById } from '@/db/profile'

export async function FundSection(props: { fundId: string }) {
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
}
