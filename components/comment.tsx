import { UserLink } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { Tag } from '@/components/tags'
import { Comment } from '@/db/comment'
import { Profile } from '@/db/profile'
import Link from 'next/link'
import clsx from 'clsx'
import { Project } from '@/db/project'
import { Card } from './layout/card'
import { Avatar } from './avatar'

export function Comment(props: {
  comment: Comment
  commenter: Profile
  writtenByCreator?: boolean
  contributionText?: string
  project?: Project
  children?: React.ReactNode
}) {
  const {
    comment,
    commenter,
    writtenByCreator,
    contributionText,
    project,
    children,
  } = props
  return (
    <Row className="gap-2">
      <Link href={`/${commenter.username}`}>
        <Avatar
          username={commenter.username}
          avatarUrl={commenter.avatar_url}
          id={commenter.id}
          className="mt-1"
          size="sm"
          noLink
        />
      </Link>
      <Card
        id={comment.id}
        className="relative rounded-xl rounded-tl-sm px-6 pt-2"
      >
        <Row className="mb-2 w-full items-center justify-between gap-2">
          <Row className="min-w-fit items-center gap-1">
            <UserLink
              name={commenter.full_name}
              username={commenter.username}
              creatorBadge={writtenByCreator}
              className="text-sm font-semibold"
            />
            <p
              className={clsx(
                'min-w-fit text-xs text-gray-500',
                project ? 'inline' : 'hidden sm:inline'
              )}
            >
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </p>
          </Row>
          {!project && (
            <Col className="items-center">
              {contributionText && (
                <Tag text={contributionText} color="orange" />
              )}
              <p className={clsx('text-xs text-gray-500 sm:hidden')}>
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </p>
            </Col>
          )}
          {project && (
            <Link
              href={`/projects/${project.slug}?tab=comments#${comment.id}`}
              className="truncate overflow-ellipsis text-xs font-semibold text-orange-600 hover:underline"
            >
              {project.title}
            </Link>
          )}
        </Row>
        <RichContent content={comment.content} className="text-sm" />
        {children}
      </Card>
    </Row>
  )
}
