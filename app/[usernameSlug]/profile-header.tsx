'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function ProfileHeader(props: {
  profile: { username: string; id: string }
  isOwnProfile: boolean
}) {
  const { profile, isOwnProfile } = props
  return (
    <div className="flex">
      <Avatar username={profile.username} id={profile.id} noLink size={24} />
      {isOwnProfile && (
        <div className="relative top-14 right-6 h-10 w-10 rounded-full bg-orange-400 hover:bg-orange-500">
          <Link href="/edit-profile">
            <PencilIcon className="h-10 w-10 p-2" aria-hidden />
          </Link>
        </div>
      )}

      <div className="ml-1 mt-2 text-4xl font-bold">{profile.username}</div>
    </div>
  )
}
