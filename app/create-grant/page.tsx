import { getAllMiniProfiles } from '@/db/profile'
import { CreateGrantForm } from './create-grant-form'
import { createServerClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProfileById } from '@/db/profile'
import { getTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { calculateUserSpendableFunds } from '@/utils/math'
import Link from 'next/link'

export default async function CreateGrantPage() {
  const supabase = createServerClient()
  const profiles = (await getAllMiniProfiles(supabase)).filter(
    (profile) => profile.type === 'individual' && profile.full_name.length > 0
  )
  const user = await getUser(supabase)
  if (!user) {
    return (
      <div>
        <Link href="/login" className="text-orange-500 hover:text-orange-600">
          Log in
        </Link>{' '}
        to give grants!
      </div>
    )
  }
  const profile = await getProfileById(supabase, user?.id)
  const txns = await getTxnsByUser(supabase, user?.id ?? '')
  const bids = await getBidsByUser(supabase, user?.id ?? '')

  if (!profile?.regranter_status) {
    return (
      // TODO: make a controllable switch to be a regranter
      <div>
        You must be a regranter to give grants.{' '}
        <Link href="/profile" className="text-orange-500 hover:text-orange-600">
          Apply to be a regranter
        </Link>
        .
      </div>
    )
  }
  const regranterSpendableFunds = calculateUserSpendableFunds(
    txns,
    profile.id,
    bids,
    profile?.accreditation_status as boolean
  )
  return (
    <CreateGrantForm
      profiles={profiles}
      regranterSpendableFunds={regranterSpendableFunds}
    />
  )
}
