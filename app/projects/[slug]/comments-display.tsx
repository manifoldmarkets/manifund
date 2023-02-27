'use client'
import { CommentAndProfile } from '@/db/comment'
import { TextEditor, useTextEditor, RichContent } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendComment } from '@/db/comment'
import { useSupabase } from '@/db/supabase-provider'
import { Profile } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { UserAvatarAndBadge } from '@/components/user-link'
import { formatDistance } from 'date-fns'

export function CommentsDisplay(props: {
  comments: CommentAndProfile[]
  project: string
  profile: Profile | null
}) {
  const { comments, project, profile } = props
  const { supabase, session } = useSupabase()

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
              {formatDistance(
                new Date(comment.created_at ? comment.created_at : 0),
                new Date(),
                { addSuffix: true }
              )}
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
      Comment Section
      {profile && (
        <WriteComment supabase={supabase} project={project} profile={profile} />
      )}
      {commentsDisplay}
    </div>
  )
}

function WriteComment(props: {
  supabase: SupabaseClient
  project: string
  profile: Profile
}) {
  const { supabase, project, profile } = props
  const editor = useTextEditor('')

  function setState(arg0: { comment: string }) {
    throw new Error('Function not implemented.')
  }

  return (
    <div>
      <TextEditor editor={editor}></TextEditor>
      <PaperAirplaneIcon
        className="h-6 w-6 text-orange-500 hover:cursor-pointer"
        onClick={() => {
          if (!editor?.getJSON() || !editor?.getJSON().content) {
            return
          }
          sendComment(supabase, editor?.getJSON(), project, profile.id)
          setState({ comment: '' })
        }}
      />
    </div>
  )
}
