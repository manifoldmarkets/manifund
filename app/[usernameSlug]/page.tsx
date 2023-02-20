import { getProfileByUsername } from '@/db/profile'
import { createClient, getUser } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createClient()
  const user = await getUser(supabase)
  const profile = await getProfileByUsername(supabase, usernameSlug)
  const isOwnProfile = user?.id === profile?.id
  return (
    <div className="flex flex-col gap-2 p-5">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      {profile?.username} profile page
      {isOwnProfile && (
        <>
          <SignOutButton />
        </>
      )}
    </div>
  )
}
