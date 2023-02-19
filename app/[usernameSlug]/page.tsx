import { getProfileByUsername } from '@/db/profile'
import { createClient, getUser } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { Button } from '@/components/button'
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
    <div className="flex flex-col gap-2">
      {profile?.username} profile page
      {isOwnProfile && (
        <>
          <div className="h-12 w-12 rounded-full bg-orange-400 hover:bg-orange-500">
            <Link href="/edit-profile">
              <PencilIcon className="h-12 w-12 p-2" aria-hidden />
            </Link>
          </div>
          <SignOutButton />
        </>
      )}
      <ProfileHeader profile={profile} />
    </div>
  )
}
