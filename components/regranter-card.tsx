import { Profile } from '@/db/profile'
import clsx from 'clsx'
import { Card } from './card'
import Link from 'next/link'
import { Avatar } from './avatar'
import { Row } from './layout/row'
import { Col } from './layout/col'
import { addHttpToUrl } from '@/utils/formatting'
import { LinkIcon } from '@heroicons/react/20/solid'

export function RegranterCard(props: {
  regranter: Profile
  className?: string
}) {
  const { regranter, className } = props
  return (
    <Card
      className={clsx(
        'relative flex h-full flex-col gap-4 border-none py-6',
        className
      )}
    >
      <Link
        href={addHttpToUrl(regranter.website ?? '')}
        className="absolute top-3 right-3"
      >
        <LinkIcon className="h-5 w-5 rounded bg-gray-300 p-0.5 text-white" />
      </Link>
      <Link href={`/${regranter.username}`} className="flex h-full flex-col">
        <Row className="m-3 justify-center">
          <Avatar
            avatarUrl={regranter.avatar_url}
            username={regranter.username}
            size={24}
          />
        </Row>
        <Col className="flex h-full w-full flex-col gap-1">
          <span className="text-center text-lg font-bold">
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
