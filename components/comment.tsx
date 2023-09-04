import { UserAvatarAndBadge } from '@/components/user-link'
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

export function Comment(props: {
  comment: Comment
  commenter: Profile
  writtenByCreator?: boolean
  contributionText?: string
  project?: Project
}) {
  const { comment, commenter, writtenByCreator, contributionText, project } =
    props
  return (
    <div>
      <Row className="w-full items-center justify-between gap-2">
        <Row className="min-w-fit items-center gap-1">
          <UserAvatarAndBadge
            profile={commenter}
            creatorBadge={writtenByCreator}
            className="text-sm text-gray-800"
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
            {contributionText && <Tag text={contributionText} color="orange" />}
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
      <div className="relative left-8 w-11/12">
        <RichContent content={comment.content} className="text-sm" />
      </div>
    </div>
  )
}
