import {
  getProfileAndBidsById,
  getProfileByUsername,
  getUser,
} from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { getFullTxnsByUser, getTxnsByUser } from '@/db/txn'
import { getProjectsByUser } from '@/db/project'
import { ProfileTabs } from './profile-tabs'
import { getBidsByUser } from '@/db/bid'
import { getCommentsByUser } from '@/db/comment'

export const revalidate = 60

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const profile = await getProfileByUsername(supabase, usernameSlug)
  if (!profile) {
    return <div>User not found</div>
  }
  const [bids, projects, txns, comments, user] = await Promise.all([
    getBidsByUser(supabase, profile.id),
    getProjectsByUser(supabase, profile.id),
    getFullTxnsByUser(supabase, profile.id),
    getCommentsByUser(supabase, profile.id),
    getUser(supabase),
  ])
  const [userTxns, userProfile] = await Promise.all([
    user ? getTxnsByUser(supabase, user.id) : null,
    user ? getProfileAndBidsById(supabase, user.id) : null,
  ])
  const isOwnProfile = user?.id === profile?.id
  return (
    <div className="flex flex-col p-3 sm:p-5">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <div className="flex flex-col gap-10">
        <ProfileTabs
          profile={profile}
          projects={projects}
          comments={comments}
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
