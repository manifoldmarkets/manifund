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

export function RegranterCard(props: {
  regranter: Profile
  className?: string
}) {
  const { regranter, className } = props
  const sponsoredAmount = getSponsoredAmount(regranter.id)
  return (
    <Card
      className={clsx(
        'relative flex h-full flex-col gap-4 border-none py-6',
        className
      )}
    >
      {regranter.website && (
        <Link
          href={addHttpToUrl(regranter.website)}
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
      <Link href={`/${regranter.username}`} className="flex h-full flex-col">
        <Row className="mt-5 mb-3 justify-center">
          <Avatar
            avatarUrl={regranter.avatar_url}
            username={regranter.username}
            size={24}
            className="shadow-md"
          />
        </Row>
        <Col className="flex h-full w-full flex-col gap-1">
          <span className="text-center font-bold sm:text-lg">
            {regranter.full_name}
          </span>
          <Col className="h-full justify-center">
            <span className="text-center text-sm font-light leading-tight text-gray-500 line-clamp-3">
              {regranter.bio}
            </span>
          </Col>
        </Col>
      </Link>
    </Card>
  )
}

export function RegranterHighlight(props: { regranter: Profile }) {
  const { regranter } = props
  return (
    <Col className="cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100">
      <Row className="justify-center">
        <Avatar
          avatarUrl={regranter.avatar_url}
          username={regranter.username}
          size={24}
          className="hidden shadow-md sm:block"
        />
        <Avatar
          avatarUrl={regranter.avatar_url}
          username={regranter.username}
          size={16}
          className="shadow-md sm:hidden"
        />
      </Row>
      <Link
        href={`/${regranter.username}`}
        className="flex h-full flex-col gap-2"
      >
        <h1 className="text-center font-semibold text-gray-900 group-hover:underline">
          {regranter.full_name}
        </h1>
        <span className="text-center text-sm font-light leading-tight text-gray-600 line-clamp-3">
          {regranter.bio}
        </span>
      </Link>
    </Col>
  )
}
