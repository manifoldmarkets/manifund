import { getProfileById, getProfileByUsername, getUser } from '@/db/profile'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { getFullTxnsByUser, getTxnsByUser } from '@/db/txn'
import { getProjectsByUser } from '@/db/project'
import { ProfileContent } from './profile-content'
import { getBidsByUser } from '@/db/bid'
import { getCommentsByUser } from '@/db/comment'
import FundPage from '../funds/[fundSlug]/page'
import NotFound from '../not-found'

export const revalidate = 60

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = await createServerSupabaseClient()
  const profile = await getProfileByUsername(supabase, usernameSlug)
  if (!profile) {
    return <NotFound />
  } else if (profile.type === 'fund') {
    return <FundPage params={{ fundSlug: usernameSlug }} />
  } else if (profile.type !== 'individual') {
    return <div>Profile type not supported</div>
  }
  const [bids, projects, txns, comments, user] = await Promise.all([
    getBidsByUser(supabase, profile.id),
    getProjectsByUser(supabase, profile.id),
    getFullTxnsByUser(supabase, profile.id),
    getCommentsByUser(supabase, profile.id),
    getUser(supabase),
  ])
  const [userTxns, userProfile, userBids] = await Promise.all([
    user ? getTxnsByUser(supabase, user.id) : undefined,
    user ? getProfileById(supabase, user.id) : undefined,
    user ? getBidsByUser(supabase, user.id) : undefined,
  ])
  const isOwnProfile = user?.id === profile?.id
  return (
    <div className="flex flex-col gap-8 p-3 sm:p-5">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        email={isOwnProfile ? user.email : undefined}
      />
      <ProfileContent
        profile={profile}
        projects={projects}
        comments={comments}
        bids={bids}
        txns={txns}
        userProfile={userProfile}
        userTxns={userTxns}
        userBids={userBids}
      />
    </div>
  )
}
