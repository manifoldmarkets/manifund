import { Profile } from '@/db/profile'
import { WriteComment } from './write-comment'
import { getCommentsByProject } from '@/db/comment'
import { createServerClient } from '@/db/supabase-server'
import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistanceToNow } from 'date-fns'
import { RichContent } from '@/components/editor'
import { Avatar } from '@/components/avatar'
import { Divider } from '@/components/divider'

export async function Comments(props: {
  project: string
  profile: Profile | null
}) {
  const { project, profile } = props
  const supabase = createServerClient()
  const comments = await getCommentsByProject(supabase, project)
  const commentsDisplay = comments.map((comment) => (
    <div key={comment.id}>
      <div className="my-6 flex flex-row gap-2">
        <div>
          <div className="flex flex-row gap-2">
            <UserAvatarAndBadge
              name={comment.profiles.full_name}
              username={comment.profiles.username}
              id={comment.profiles.id}
            />
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
      {(comments.length > 0 || profile) && (
        <h1 className="mb-5 text-3xl font-bold">Comments</h1>
      )}
      {profile && (
        <div>
          <div className="flex gap-3">
            <Avatar id={profile.id} />
            <WriteComment project={project} profile={profile} />
          </div>
          <Divider />
        </div>
      )}
      {commentsDisplay}
    </div>
  )
}
