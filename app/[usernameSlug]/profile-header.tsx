'use client'
import { Avatar } from '@/components/avatar'

export function ProfileHeader(props: {
  profile: { username: string; id: string }
}) {
  const { profile } = props
  return (
    <div className="flex items-center">
      <Avatar username={profile.username} id={profile.id} noLink size={24} />
      <div className="ml-2">{profile.username}</div>
    </div>
  )
}
