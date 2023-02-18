import { getProfileByUsername } from '@/db/profile'
import { createClient, getUser } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'

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
      {isOwnProfile && (
        <div className="bg-orange-400 rounded-full h-12 w-12 hover:bg-orange-500">
          <Link href="/edit-profile">
            <PencilIcon className="h-12 w-12 p-2" aria-hidden />
          </Link>
        </div>
      )}
      <ProfileHeader profile={profile} />
    </div>
  )
}
