import { Profile } from '@/db/profile'
import clsx from 'clsx'
import { Card } from './layout/card'
import Link from 'next/link'
import { Avatar } from './avatar'
import { Row } from './layout/row'
import { Col } from './layout/col'
import { addHttpToUrl, formatMoney } from '@/utils/formatting'
import { LinkIcon } from '@heroicons/react/20/solid'
import {
  getSponsoredAmount2023,
  getSponsoredAmount2024,
} from '@/utils/constants'
import { SponsoredTag } from './tags'

export function ProfileCard(props: { profile: Profile; className?: string }) {
  const { profile, className } = props
  const sponsoredAmount2023 = getSponsoredAmount2023(profile.id)
  const sponsoredAmount2024 = getSponsoredAmount2024(profile.id)
  return (
    <Card
      className={clsx(
        'relative flex h-full flex-col gap-4 border-none py-3',
        className
      )}
    >
      <Link href={`/${profile.username}`} className="flex h-full flex-col">
        <Row className="mb-3 mt-2 justify-center">
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
            <span className="line-clamp-3 text-center text-sm font-light leading-tight text-gray-500">
              {profile.bio}
            </span>
          </Col>
        </Col>
      </Link>
      <Row className="items-center justify-between">
        <Row className="gap-1">
          {sponsoredAmount2024 > 0 && (
            <SponsoredTag
              text={`${formatMoney(sponsoredAmount2024)}`}
              active
              className="absolute left-3 top-3"
            />
          )}
          {sponsoredAmount2023 > 0 && (
            <SponsoredTag
              text={`${formatMoney(sponsoredAmount2023)}`}
              className="absolute left-3 top-3"
            />
          )}
        </Row>
        {profile.website && (
          <Link href={addHttpToUrl(profile.website)}>
            <LinkIcon className="h-5 w-5 rounded bg-gray-100 stroke-2 p-1 text-gray-600 hover:bg-gray-200" />
          </Link>
        )}
      </Row>
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
          <span className="line-clamp-3 text-center text-sm font-normal leading-6 text-gray-600">
            {profile.bio}
          </span>
        </Col>
      </Link>
    </Col>
  )
}
