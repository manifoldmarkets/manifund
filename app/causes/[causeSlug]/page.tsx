import { createServerClient } from '@/db/supabase-server'
import { getFullProjectsByCause } from '@/db/project'
import Image from 'next/image'
import { getCause, listMiniCauses } from '@/db/cause'
import { CauseTabs } from './cause-tabs'
import { CauseData } from './cause-data'
import { getUser, Profile } from '@/db/profile'
import { calculateCharityBalance } from '@/utils/math'
import {
  getIncomingTxnsByUserWithDonor,
  getTxnAndProjectsByUser,
} from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { getProfileById } from '@/db/profile'

export const revalidate = 60

export async function generateMetadata(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  return {
    title: cause.slug,
  }
}

export default async function CausePage(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  const causesList = await listMiniCauses(supabase)
  const projects = await getFullProjectsByCause(supabase, cause.slug)
  const user = await getUser(supabase)
  const fund = cause.fund_id
    ? await getProfileById(supabase, cause.fund_id)
    : undefined
  const fundTxns = fund
    ? await getIncomingTxnsByUserWithDonor(supabase, fund.id)
    : []
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
    <div className="bg-dark-200 mx-auto max-w-4xl p-6">
      {cause.header_image_url && (
        <Image
          src={cause.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="header image"
        />
      )}
      <h1 className="mb-1 mt-3 text-3xl font-bold lg:text-4xl">
        {cause.title}
      </h1>
      <CauseData projects={projects} />
      <CauseTabs
        cause={cause}
        projects={projects}
        causesList={causesList}
        fund={fund}
        fundTxns={fundTxns}
        userId={user?.id}
        charityBalance={charityBalance}
      />
    </div>
  )
}
