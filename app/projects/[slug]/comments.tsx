'use client'
import { Profile } from '@/db/profile'
import { WriteComment } from './write-comment'
import { CommentAndProfileAndTxns } from '@/db/comment'
import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent } from '@/components/editor'
import { Project } from '@/db/project'
import { ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { IconButton } from '@/components/button'
import { useState } from 'react'
import { orderBy, sortBy } from 'lodash'
import { Col } from '@/components/layout/col'
import { Tooltip } from '@/components/tooltip'
import { Tag } from '@/components/tags'

export function Comments(props: {
  project: Project
  comments: CommentAndProfileAndTxns[]
  user: Profile | null
}) {
  const { project, comments, user } = props
  const [replyingTo, setReplyingTo] = useState<CommentAndProfileAndTxns | null>(
    null
  )
  const rootComments = comments.filter(
    (comment) => comment.replying_to === null
  )
  const replyComments = comments.filter(
    (comment) => comment.replying_to !== null
  )
  if (comments.length === 0 && !user)
    return (
      <p className="text-center italic text-gray-500">
        No comments yet.{' '}
        <a href="/login" className="hover:underline">
          Sign in
        </a>{' '}
        to create one!
      </p>
    )
  const threads = genThreads(rootComments, replyComments)
  const commentsDisplay = threads.map((thread) => (
    <div key={thread.root.id}>
      <Row className="w-full">
        <div className="w-full">
          <Comment
            comment={thread.root}
            writtenByCreator={thread.root.commenter === project.creator}
          />
          {user && (
            <Row className="w-full justify-end">
              <Tooltip text="Reply">
                <IconButton onClick={() => setReplyingTo(thread.root)}>
                  <ArrowUturnRightIcon className="relative bottom-2 h-4 w-4 rotate-180 text-gray-500 hover:text-gray-700" />
                </IconButton>
              </Tooltip>
            </Row>
          )}

          {thread.replies.map((reply) => (
            <div className="ml-8 mt-1" key={reply.id}>
              <Comment
                comment={reply}
                writtenByCreator={reply.commenter === project.creator}
              />
            </div>
          ))}
          {replyingTo?.id === thread.root.id && user && (
            <div className="mt-1 ml-8">
              <WriteComment
                project={project}
                commenter={user}
                replyingToId={thread.root.id}
              />
            </div>
          )}
        </div>
      </Row>
    </div>
  ))
  return (
    <div>
      {user && (
        <div className="mb-5">
          <WriteComment project={project} commenter={user} />
        </div>
      )}
      {commentsDisplay}
    </div>
  )
}

type Thread = {
  root: CommentAndProfileAndTxns
  replies: CommentAndProfileAndTxns[]
}
function genThreads(
  rootComments: CommentAndProfileAndTxns[],
  replyComments: CommentAndProfileAndTxns[]
) {
  const threads = Object.fromEntries(
    rootComments.map((comment) => [
      comment.id,
      { root: comment, replies: [] } as Thread,
    ])
  )
  replyComments.forEach((reply) => {
    threads[reply.replying_to ?? 0].replies.push(reply)
  })
  const threadsArray = Object.values(threads)
  threadsArray.forEach((thread) => {
    thread.replies = sortBy(thread.replies, 'created_at')
  })
  return orderBy(threadsArray, 'root.created_at', 'desc')
}

function Comment(props: {
  comment: CommentAndProfileAndTxns
  writtenByCreator?: boolean
}) {
  const { comment, writtenByCreator } = props
  return (
    <div>
      <Row className="w-full items-center justify-between gap-2">
        <Row className="items-center gap-1">
          <UserAvatarAndBadge
            profile={comment.profiles}
            creatorBadge={writtenByCreator}
            className="text-sm text-gray-800"
          />
          {comment.txns && (
            <Tag
              text={`DONATED $${comment.txns.amount}`}
              color="orange"
              className="hidden sm:block"
            />
          )}
        </Row>
        <Col className="items-center text-xs text-gray-500">
          {comment.txns && (
            <Tag
              text={`DONATED $${comment.txns.amount}`}
              color="orange"
              className="sm:hidden"
            />
          )}
          {formatDistanceToNow(new Date(comment.created_at), {
            addSuffix: true,
          })}
        </Col>
      </Row>
      <div className="relative left-8 w-11/12">
        <RichContent content={comment.content} />
      </div>
    </div>
  )
}
