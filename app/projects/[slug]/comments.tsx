'use client'
import { Profile } from '@/db/profile'
import { WriteComment } from './write-comment'
import { CommentAndProfile, getCommentsByProject } from '@/db/comment'
import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent } from '@/components/editor'
import { Avatar } from '@/components/avatar'
import { Divider } from '@/components/divider'
import { Project } from '@/db/project'
import { ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { Row } from '@/components/layout/row'
import { IconButton } from '@/components/button'
import { ReactNode, useEffect, useState } from 'react'
import { orderBy, sortBy } from 'lodash'
import clsx from 'clsx'

export function Comments(props: {
  project: Project
  comments: CommentAndProfile[]
  user: Profile | null
}) {
  const { project, comments, user } = props
  const [replyingTo, setReplyingTo] = useState<CommentAndProfile | null>(null)
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
        <div className="MT w-full">
          <CommentWrapper className="mt-2 pb-0">
            <Comment comment={thread.root} />
            {user && (
              <Row className="w-full justify-end">
                <IconButton onClick={() => setReplyingTo(thread.root)}>
                  <ArrowUturnRightIcon className="h-5 w-5 rotate-180 text-gray-500 hover:text-gray-700" />
                </IconButton>
              </Row>
            )}
          </CommentWrapper>

          {thread.replies.map((reply) => (
            <CommentWrapper key={reply.id} className="ml-8">
              <Comment comment={reply} />
            </CommentWrapper>
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
        <div>
          <div className="flex gap-3">
            <WriteComment project={project} commenter={user} />
          </div>
          <Divider />
        </div>
      )}
      {commentsDisplay}
    </div>
  )
}

type Thread = {
  root: CommentAndProfile
  replies: CommentAndProfile[]
}
function genThreads(
  rootComments: CommentAndProfile[],
  replyComments: CommentAndProfile[]
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

function Comment(props: { comment: CommentAndProfile }) {
  const { comment } = props
  return (
    <div className="w-11/12">
      <Row className="justify-between gap-2">
        <UserAvatarAndBadge profile={comment.profiles} />
        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(comment.created_at), {
            addSuffix: true,
          })}
        </div>
      </Row>
      <div className="relative left-8">
        <RichContent content={comment.content} />
      </div>
    </div>
  )
}

function CommentWrapper(props: { className?: string; children?: ReactNode }) {
  const { className, children } = props
  return (
    <div
      className={clsx(
        className,
        'my-1 rounded-md border border-gray-300 bg-white p-5'
      )}
    >
      {children}
    </div>
  )
}
