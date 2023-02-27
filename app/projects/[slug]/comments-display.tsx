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
import { Divider } from '@/components/divider'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/avatar'

export function CommentsDisplay(props: {
  comments: CommentAndProfile[]
  project: string
  profile: Profile | null
}) {
  const { comments, project, profile } = props
  const { supabase } = useSupabase()

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
      {(comments.length > 0 || profile) && (
        <h1 className="mb-5 text-3xl font-bold">Comments</h1>
      )}
      {profile && (
        <div>
          <div className="flex gap-3">
            <Avatar id={profile.id} />
            <WriteComment
              supabase={supabase}
              project={project}
              profile={profile}
            />
          </div>
          <Divider />
        </div>
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
  const router = useRouter()

  return (
    <div className="w-full">
      <TextEditor editor={editor}></TextEditor>
      <div className="flex justify-end">
        <PaperAirplaneIcon
          className="m-2 h-8 w-8 text-orange-500 hover:cursor-pointer"
          onClick={async () => {
            if (!editor?.getJSON() || !editor?.getJSON().content) {
              return
            }
            await sendComment(supabase, editor?.getJSON(), project, profile.id)
            editor.commands.clearContent()
            router.refresh()
          }}
        />
      </div>
    </div>
  )
}
