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
      <div className="my-6 flex flex-row gap-2">
        <div>
          <div className="flex flex-row gap-2">
            <UserAvatarAndBadge profile={comment.profiles} />
            <div className="text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>
          <div className="relative left-8">
            <RichContent content={comment.content} />
          </div>
        </div>
      </div>
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
