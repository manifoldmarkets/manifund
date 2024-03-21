'use client'
import { Avatar } from '@/components/avatar'
import { PencilIcon, LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Database } from '@/db/database.types'
import { AccreditedTag, RegranterTag } from '@/components/tags'
import { addHttpToUrl } from '@/utils/formatting'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { SignOutButton } from './sign-out-button'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileHeader(props: {
  profile: Profile
  isOwnProfile: boolean
  email: string
}) {
  const { profile, isOwnProfile, email } = props
  const website = addHttpToUrl(profile.website ?? '')
  return (
    <div className="flex flex-col gap-3">
      <Row className="w-full items-start justify-between">
        <Row>
          <Avatar
            username={profile.username}
            avatarUrl={profile.avatar_url}
            id={profile.id}
            noLink
            className="hidden sm:block"
            size={24}
          />
          <Avatar
            username={profile.username}
            avatarUrl={profile.avatar_url}
            id={profile.id}
            noLink
            size={12}
            className="sm:hidden"
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
                <div className="text-xl font-bold leading-none sm:text-2xl">
                  {profile.full_name}
                </div>
                <Row className="mt-1 flex-wrap items-center gap-2 text-gray-500">
                  <p>@{profile.username}</p>
                  {profile.accreditation_status && <AccreditedTag />}
                  {profile.regranter_status && <RegranterTag />}
                </Row >
                {isOwnProfile && (
                  <Row className="mt-1 flex-wrap items-center gap-2 text-gray-400">
                    <p>{email}</p>
                  </Row>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        {isOwnProfile && <SignOutButton />}
      </Row>
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
