'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendComment } from '@/db/comment'
import { Profile } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/db/supabase-provider'

export function WriteComment(props: { project: string; profile: Profile }) {
  const { project, profile } = props
  const { supabase } = useSupabase()
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
