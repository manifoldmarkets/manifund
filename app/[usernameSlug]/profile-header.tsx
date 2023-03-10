'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon, LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Database } from '@/db/database.types'
import { BalanceBox } from './balance-box'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader(props: {
  profile: Profile
  isOwnProfile: boolean
  balance: number
}) {
  const { profile, isOwnProfile, balance } = props
  // Add https:// to website if it doesn't have it
  const website = profile.website?.startsWith('http')
    ? profile.website
    : `https://${profile.website}`
  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <Avatar profile={profile} noLink size={24} />
        {isOwnProfile && (
          <div className="relative top-14 right-6 h-10 w-10 rounded-full bg-orange-400 hover:bg-orange-500">
            <Link href="/edit-profile">
              <PencilIcon className="h-10 w-10 p-2" aria-hidden />
            </Link>
          </div>
        )}
        <div className="flex w-full flex-col">
          <div className="flex justify-between">
            <div className="ml-3 flex flex-col">
              <div className="text-4xl font-bold">{profile.full_name}</div>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
            {isOwnProfile && <BalanceBox balance={balance} />}
          </div>
        </div>
      </div>
      <div>
        <p>{profile.bio}</p>
        {profile.website && (
          <a
            className="flex gap-1 text-gray-500 hover:cursor-pointer hover:underline"
            href={website}
          >
            <LinkIcon className="relative top-1 h-4 w-4" strokeWidth={2.5} />
            {profile.website}
          </a>
        )}
        <hr className="my-5 h-0.5 rounded-sm bg-gray-500" />
      </div>
    </div>
  )
}
