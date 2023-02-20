'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function ProfileHeader(props: {
  profile: { username: string; id: string }
}) {
  const { profile } = props
  return (
    <div className="flex items-center">
      <Avatar username={profile.username} id={profile.id} noLink size={24} />
      <div className="relative top-6 right-6 h-10 w-10 rounded-full bg-orange-400 hover:bg-orange-500">
        <Link href="/edit-profile">
          <PencilIcon className="h-10 w-10 p-2" aria-hidden />
        </Link>
      </div>

      <div className="ml-2">{profile.username}</div>
    </div>
  )
}
