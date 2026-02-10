import { createServerSupabaseClient } from '@/db/supabase-server'
import { getProfileByUsername, getProfileById, getUser } from '@/db/profile'
import {
  getTxnAndProjectsByUser,
  getIncomingTxnsByUserWithDonor,
} from '@/db/txn'
import { DonateBox } from '@/components/donate-box'
import { getBidsByUser } from '@/db/bid'
import Image from 'next/image'
import { LinkIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { Stat } from '@/components/stat'
import { formatMoney, addHttpToUrl } from '@/utils/formatting'
import { uniq } from 'es-toolkit'
import { Col } from '@/components/layout/col'
import Link from 'next/link'
import { DonationsHistory } from '@/components/donations-history'
import { calculateCharityBalance } from '@/utils/math'

export const revalidate = 60

export default async function CharityPage(props: {
  params: Promise<{ charitySlug: string }>
}) {
  const { charitySlug } = (await props.params)
  const supabase = await createServerSupabaseClient()
  const charity = await getProfileByUsername(supabase, charitySlug)
  if (!charity) {
    return <div>Charity not found.</div>
  }
  const [donations, user] = await Promise.all([
    getIncomingTxnsByUserWithDonor(supabase, charity.id),
    getUser(supabase),
  ])
  const [profile, txns, bids] = await Promise.all([
    user ? getProfileById(supabase, user.id) : undefined,
    user ? getTxnAndProjectsByUser(supabase, user.id) : [],
    user ? getBidsByUser(supabase, user.id) : [],
  ])

  const raised = donations.reduce((acc, txn) => acc + txn.amount, 0)
  const numSupporters = uniq(donations.map((txn) => txn.from_id)).length
  const userCharityBalance = calculateCharityBalance(
    txns,
    bids,
    profile?.id as string,
    profile?.accreditation_status as boolean
  )
  return (
    <div className="p-4">
      <figure className="relative h-32 w-full rounded-sm bg-white">
        {charity.avatar_url ? (
          <Image src={charity.avatar_url} alt="" fill objectFit="contain" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-slate-300 to-indigo-200" />
        )}
      </figure>
      <h1 className="mb-2 mt-3 text-3xl font-bold">{charity.full_name}</h1>
      {charity.website && (
        <span className="text-orange-600">
          <LinkIcon className="mr-1 inline-block h-4 w-4 stroke-2" />
          <Link
            className="hover:underline"
            href={addHttpToUrl(charity.website)}
          >
            {charity.website}
          </Link>
        </span>
      )}
      <p className="mb-10 mt-1 text-gray-600">{charity.bio}</p>
      <Row className="justify-between">
        <Col className="mx-5 my-3 justify-between">
          <Stat label="raised" value={formatMoney(raised)} />
          <Stat label="supporters" value={numSupporters.toString()} />
        </Col>
        <div className="mx-5">
          <DonateBox
            charity={charity}
            profile={profile}
            maxDonation={userCharityBalance}
          />
        </div>
      </Row>
      <div className="relative mt-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-2 text-gray-500">
            Donation history
          </span>
        </div>
      </div>
      <DonationsHistory donations={donations} />
    </div>
  )
}
