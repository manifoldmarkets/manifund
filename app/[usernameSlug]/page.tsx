import { getProfileByUsername, getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { ProposalBids } from './user-proposal-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = await getProfileByUsername(supabase, usernameSlug)
  const isOwnProfile = user?.id === profile?.id
  return (
    <div className="flex flex-col gap-10 p-5">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

      {/* @ts-expect-error Server Component */}
      {isOwnProfile && <ProposalBids user={profile?.id} />}
      {/* @ts-expect-error Server Component */}
      <Investments user={profile?.id} />
      {/* @ts-expect-error Server Component */}
      <Projects user={profile?.id} />
      {isOwnProfile && (
        <div className="mt-5 flex justify-center">
          <SignOutButton />
        </div>
      )}
    </div>
  )
}
