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
  const sortedComments = orderBy(comments, 'created_at', 'desc')
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">Comments</h1>
      <Col className="gap-8">
        {sortedComments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              comment={comment}
              commenter={profile}
              commentHref={`/projects/${comment.projects.slug}?tab=comments#${comment.id}`}
              projectTitle={comment.projects.title}
            />
          )
        })}
      </Col>
    </div>
  )
}
