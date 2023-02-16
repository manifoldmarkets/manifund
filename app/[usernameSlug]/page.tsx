import { getProfileByUsername } from '@/db/profile'
import { createClient, getUser } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createClient()
  const user = await getUser(supabase)
  const profile = await getProfileByUsername(supabase, usernameSlug)
  const isOwnProfile = user?.id === profile?.id
  return (
    <div>
      {profile?.username} profile page
      {isOwnProfile && <div>edit profile</div>}
      <ProfileHeader profile={profile} />
    </div>
  )
}
