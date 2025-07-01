'use client'

import { Col } from '@/components/layout/col'
import { Comment } from '@/components/comment'
import { FullComment } from '@/db/comment'

export function CommentsSection({
  comments,
  userId,
}: {
  comments: FullComment[]
  userId?: string
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Comments</h2>
        <a
          href="/projects?tab=comments"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          View all →
        </a>
      </div>
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
