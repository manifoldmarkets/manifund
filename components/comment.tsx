import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { Tag } from '@/components/tags'
import { Comment } from '@/db/comment'
import { Profile } from '@/db/profile'

export function Comment(props: {
  comment: Comment
  commenter: Profile
  writtenByCreator?: boolean
  contributionText?: string
}) {
  const { comment, commenter, writtenByCreator, contributionText } = props
  return (
    <div>
      <Row className="w-full items-center justify-between gap-2">
        <Row className="items-center gap-1">
          <UserAvatarAndBadge
            profile={commenter}
            creatorBadge={writtenByCreator}
            className="text-sm text-gray-800"
          />
          <p className="hidden text-xs text-gray-500 sm:inline">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </p>
        </Row>
        <Col className="items-center">
          {contributionText && <Tag text={contributionText} color="orange" />}
          <p className="text-xs text-gray-500 sm:hidden">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </p>
        </Col>
      </Row>
      <div className="relative left-8 w-11/12">
        <RichContent content={comment.content} className="sm:text-md text-sm" />
      </div>
    </div>
  )
}
