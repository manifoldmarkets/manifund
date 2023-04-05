'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon, LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Database } from '@/db/database.types'
import { BalanceBox } from './balance-box'
import { InvestorTypeTag } from '@/components/tags'
import { Row } from '@/components/layout/row'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader(props: {
  profile: Profile
  isOwnProfile: boolean
  balance: number
  withdrawBalance: number
}) {
  const { profile, isOwnProfile, balance, withdrawBalance } = props
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
              <div className="text-3xl font-bold">{profile.full_name}</div>
              <div className="flex flex-col gap-2 text-gray-500 md:flex-row">
                <p>@{profile.username}</p>
                <InvestorTypeTag
                  accredited={profile.accreditation_status}
                  longTooltip={isOwnProfile}
                />
              </div>
            </div>
            {isOwnProfile && (
              <BalanceBox
                balance={balance}
                withdrawBalance={withdrawBalance}
                accredited={profile.accreditation_status}
              />
            )}
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
