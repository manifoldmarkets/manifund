import { Profile } from '@/db/profile'
import clsx from 'clsx'
import { Card } from './card'
import Link from 'next/link'
import { Avatar } from './avatar'
import { Row } from './layout/row'
import { Col } from './layout/col'
import { addHttpToUrl, formatMoney } from '@/utils/formatting'
import { LinkIcon } from '@heroicons/react/20/solid'
import { getSponsoredAmount } from '@/utils/constants'
import { SponsoredTag } from './tags'

export function ProfileCard(props: { profile: Profile; className?: string }) {
  const { profile, className } = props
  const sponsoredAmount = getSponsoredAmount(profile.id)
  return (
    <Card
      className={clsx(
        'relative flex h-full flex-col gap-4 border-none py-6',
        className
      )}
    >
      {profile.website && (
        <Link
          href={addHttpToUrl(profile.website)}
          className="absolute top-3 right-3"
        >
          <LinkIcon className="h-5 w-5 rounded bg-gray-300 p-0.5 text-white" />
        </Link>
      )}
      {sponsoredAmount !== 0 && (
        <SponsoredTag
          text={`${formatMoney(sponsoredAmount)}`}
          className="absolute top-3 left-3"
        />
      )}
      <Link href={`/${profile.username}`} className="flex h-full flex-col">
        <Row className="mt-5 mb-3 justify-center">
          <Avatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size={24}
            id={profile.id}
            className="shadow-md"
          />
        </Row>
        <Col className="flex h-full w-full flex-col gap-1">
          <span className="text-center font-bold sm:text-lg">
            {profile.full_name}
          </span>
          <Col className="h-full justify-center">
            <span className="text-center text-sm font-light leading-tight text-gray-500 line-clamp-3">
              {profile.bio}
            </span>
          </Col>
        </Col>
      </Link>
    </Card>
  )
}

export function CardlessProfile(props: { profile: Profile }) {
  const { profile } = props
  return (
    <Col className="h-full cursor-pointer items-center gap-3 rounded p-3 hover:bg-gray-100">
      <Row className="justify-center">
        <Avatar
          avatarUrl={profile.avatar_url}
          username={profile.username}
          id={profile.id}
          size={24}
          className="hidden shadow-md sm:block"
        />
        <Avatar
          avatarUrl={profile.avatar_url}
          username={profile.username}
          id={profile.id}
          size={16}
          className="shadow-md sm:hidden"
        />
      </Row>
      <Link
        href={`/${profile.username}`}
        className="flex h-full flex-col justify-between gap-2"
      >
        <h1 className="text-center font-semibold text-gray-900 group-hover:underline">
          {profile.full_name}
        </h1>
        <Col className="h-full justify-center">
          <span className="text-center text-sm font-normal leading-6 text-gray-600 line-clamp-3">
            {profile.bio}
          </span>
        </Col>
      </Link>
    </Col>
  )
}
