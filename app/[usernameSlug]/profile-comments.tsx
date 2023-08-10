import { Col } from '@/components/layout/col'
import { CommentAndProject } from '@/db/comment'
import { Profile } from '@/db/profile'
import { orderBy } from 'lodash'
import { Comment } from '@/components/comment'

export function ProfileComments(props: {
  comments: CommentAndProject[]
  profile: Profile
}) {
  const { comments, profile } = props
  const filteredComments = comments.filter(
    (comment) => comment.projects.stage !== 'hidden'
  )
  const sortedComments = orderBy(filteredComments, 'created_at', 'desc')
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">Comments</h1>
      <Col className="gap-3">
        {sortedComments.map((comment) => {
          return (
            <Comment key={comment.id} comment={comment} commenter={profile} />
          )
        })}
      </Col>
    </div>
  )
}
