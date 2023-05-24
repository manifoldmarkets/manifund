import { Profile } from '@/db/profile'
import clsx from 'clsx'
import { Card } from './card'
import Link from 'next/link'
import { Avatar } from './avatar'
import { Row } from './layout/row'
import { Col } from './layout/col'

export function RegranterCard(props: {
  regranter: Profile
  className?: string
}) {
  const { regranter, className } = props
  return (
    <Link href={`/${regranter.username}`}>
      <Card
        className={clsx(
          'flex h-full flex-col gap-4 border-none p-0',
          className
        )}
      >
        <Col className="gap-2">
          <Row className="justify-center">
            <Avatar
              avatarUrl={regranter.avatar_url}
              username={regranter.username}
              size={24}
            />
          </Row>
          <div className="flex w-full flex-col gap-1">
            <span className="text-center text-xl font-bold">
              {regranter.full_name}
            </span>
            <span className="text-center text-sm font-light leading-tight text-gray-500">
              {regranter.bio}
            </span>
          </div>
          <span className="text-sm text-gray-500">{regranter.website}</span>
        </Col>
      </Card>
    </Link>
  )
}
