'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon, LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Database } from '@/db/database.types'
import { InvestorTypeTag, RegranterTag } from '@/components/tags'
import { addHttpToUrl } from '@/utils/formatting'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { useEffect, useState } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader(props: {
  profile: Profile
  isOwnProfile: boolean
}) {
  const { profile, isOwnProfile } = props
  const website = addHttpToUrl(profile.website ?? '')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])
  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <Avatar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          noLink
          size={windowWidth > 640 ? 24 : undefined}
        />
        {isOwnProfile && (
          <div className="relative top-8 right-4 h-5 w-5 rounded-full bg-orange-500 hover:bg-orange-600 sm:top-14 sm:right-6 sm:h-10 sm:w-10">
            <Link href="/edit-profile">
              <PencilIcon
                className="h-5 w-5 p-1 text-white sm:h-10 sm:w-10 sm:p-2"
                aria-hidden
              />
            </Link>
          </div>
        )}
        <Col className="ml-2 w-full">
          <Row className="justify-between">
            <Col>
              <div className="text-xl font-bold leading-tight sm:text-2xl">
                {profile.full_name}
              </div>
              <Row className="mt-1 flex-wrap gap-2 text-gray-500">
                <p>@{profile.username}</p>
                <InvestorTypeTag
                  accredited={profile.accreditation_status}
                  longTooltip={isOwnProfile}
                  showText
                />
                {profile.regranter_status && <RegranterTag />}
              </Row>
            </Col>
          </Row>
        </Col>
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
      </div>
    </div>
  )
}
