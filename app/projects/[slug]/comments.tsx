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

export function Comments(props: {
  project: Project
  comments: CommentAndProfile[]
  user: Profile | null
}) {
  const { project, comments, user } = props
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
  const sortedComments = comments.sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1
  )
  const commentsDisplay = sortedComments.map((comment) => (
    <div key={comment.id}>
      <Row className="my-3 w-full rounded p-3 hover:bg-gray-200">
        <div className="w-full">
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
          <Row className="w-full justify-end">
            <ArrowUturnRightIcon className=" w- h-5 rotate-180 text-gray-500" />
          </Row>
        </div>
      </Row>
    </div>
  ))
  return (
    <div>
      {user && (
        <div>
          <div className="flex gap-3">
            <Avatar profile={user} />
            <WriteComment project={project} profile={user} />
          </div>
          <Divider />
        </div>
      )}
      {commentsDisplay}
    </div>
  )
}
