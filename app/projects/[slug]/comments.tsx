'use client'
import { Comment } from '@/db/comment'
import { TextEditor, useTextEditor } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendComment } from '@/db/comment'
import { useSupabase } from '@/db/supabase-provider'
import { Profile } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'

export function Comments(props: {
  comments: Comment[]
  project: string
  profile: Profile | null
}) {
  const { comments, project, profile } = props
  const { supabase, session } = useSupabase()

  return (
    <div>
      Comment Section
      {profile && (
        <WriteComment supabase={supabase} project={project} profile={profile} />
      )}
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
          if (!editor?.getJSON() || !editor?.getJSON().stringify) return
          sendComment(supabase, editor?.getJSON(), project, profile.id)
        }}
      />
    </div>
  )
}
