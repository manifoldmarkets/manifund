'use client'
import { Comment } from '@/db/comment'
import { TextEditor, useTextEditor, RichContent } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendComment } from '@/db/comment'
import { useSupabase } from '@/db/supabase-provider'
import { Profile } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { UserLink } from '@/components/user-link'

export function Comments(props: {
  comments: Comment[]
  project: string
  profile: Profile | null
}) {
  const { comments, project, profile } = props
  const { supabase, session } = useSupabase()

  const commentsDisplay = comments.map((comment) => (
    <div key={comment.id}>
      <div className="flex flex-row gap-2">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div>
          <div className="flex flex-row gap-2">
            <div className="text-gray-500">{comment.created_at}</div>
          </div>
          <div>
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

  return (
    <div>
      <TextEditor editor={editor}></TextEditor>
      <PaperAirplaneIcon
        className="h-6 w-6 text-orange-500 hover:cursor-pointer"
        onClick={() => {
          if (!editor?.getJSON() || !editor?.getJSON().content) {
            console.log('no comment to send')
            console.log(editor?.getJSON())
            console.log(editor?.getJSON().content)
            return
          }
          console.log('about to send comment')
          sendComment(supabase, editor?.getJSON(), project, profile.id)
        }}
      />
    </div>
  )
}
