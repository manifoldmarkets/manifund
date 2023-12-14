import { RichContent } from '@/components/editor'
import {
  getFundByUsername,
  getUser,
  Profile,
  getProfileById,
} from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { calculateCharityBalance } from '@/utils/math'
import Image from 'next/image'
import { DonateTab } from './donate-tab'

export default async function FundPage(props: {
  params: { fundSlug: string }
}) {
  const { fundSlug } = props.params
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const fund = await getFundByUsername(supabase, fundSlug)
  if (!fund) {
    return <div>Fund not found</div>
  }
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
    <div className="p-3">
      {fund.avatar_url && (
        <Image
          src={fund.avatar_url}
          width={1000}
          height={500}
          className="relative aspect-[4/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="fund header image"
        />
      )}
      <h1 className="mt-4 text-4xl font-bold">{fund.full_name}</h1>
      <span className="text-gray-600">{fund.bio}</span>
      {user && (
        <DonateTab
          userId={user.id}
          fund={fund as Profile}
          charityBalance={charityBalance}
        />
      )}
      <RichContent className="mt-6" content={fund.long_description} />
    </div>
  )
}
