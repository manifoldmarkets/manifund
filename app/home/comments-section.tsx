'use client'

import { Col } from '@/components/layout/col'
import { Comment } from '@/components/comment'
import { FullComment } from '@/db/comment'
import { Row } from '@/components/layout/row'

export function CommentsSection({
  comments,
  userId,
}: {
  comments: FullComment[]
  userId?: string
}) {
  return (
    <section className="space-y-4">
      <div className="my-4 flex items-center justify-center">
        <div className="h-px flex-1 bg-gray-300"></div>
        <h2 className="px-6 font-serif text-2xl tracking-wide text-gray-700">
          Comments
        </h2>
        <div className="h-px flex-1 bg-gray-300"></div>
      </div>
      <Row className="justify-end">
        <a
          href="/projects?tab=comments"
          className="font-serif text-sm italic text-gray-600 hover:text-gray-900"
        >
          View all →
        </a>
      </Row>
      <Col className="gap-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            commenter={comment.profiles}
            userId={userId}
            rxns={comment.comment_rxns}
            commentHref={`/projects/${comment.projects.slug}?tab=comments#${comment.id}`}
            projectTitle={comment.projects.title}
          />
        ))}
      </Col>
    </section>
  )
}
