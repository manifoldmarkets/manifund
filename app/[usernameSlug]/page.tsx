import {
  getProfileAndBidsById,
  getProfileByUsername,
  getUser,
} from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { getFullTxnsByUser, getTxnsByUser, FullTxn } from '@/db/txn'
import { getProjectsByUser, Project } from '@/db/project'
import { ProfileTabs } from './profile-tabs'
import { getBidsByUser } from '@/db/bid'

export const revalidate = 0

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = await getProfileByUsername(supabase, usernameSlug)
  if (!profile) {
    return <div>User not found</div>
  }
  const bids = await getBidsByUser(supabase, profile.id)
  const projects = await getProjectsByUser(supabase, profile.id)
  const txns = await getFullTxnsByUser(supabase, profile.id)

  const userTxns = user?.id ? await getTxnsByUser(supabase, user?.id) : null
  const userProfile = user?.id
    ? await getProfileAndBidsById(supabase, user?.id)
    : null
  const isOwnProfile = user?.id === profile?.id

  return (
    <div className="flex flex-col p-3 sm:p-5">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <div className="flex flex-col gap-10">
        <ProfileTabs
          profile={profile}
          projects={projects}
          bids={bids}
          txns={txns}
          userProfile={userProfile}
          userTxns={userTxns}
        />
        {isOwnProfile && (
          <div className="mt-5 flex justify-center">
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  )
}

function compileDonations(txns: FullTxn[], userId: string) {
  const donations = txns.filter(
    (txn) =>
      txn.bundle === null && txn.from_id === userId && txn.token === 'USD'
  )
}
