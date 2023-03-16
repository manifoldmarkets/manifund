'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendComment } from '@/db/comment'
import { Profile } from '@/db/profile'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/db/supabase-provider'
import { Project } from '@/db/project'
import { useState } from 'react'
import { Button, IconButton } from '@/components/button'

export function WriteComment(props: { project: Project; profile: Profile }) {
  const { project, profile } = props
  const { supabase } = useSupabase()
  const editor = useTextEditor('')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="w-full">
      <TextEditor editor={editor}></TextEditor>
      <div className="flex justify-end">
        <IconButton
          loading={isSubmitting}
          onClick={async () => {
            if (editor?.getText()?.trim()) {
              setIsSubmitting(true)
              const content = editor?.getJSON()
              const htmlContent = editor?.getHTML()
              if (!content || content.length === 0 || !editor || !htmlContent) {
                return
              }
              await sendComment(
                supabase,
                content,
                htmlContent,
                project,
                profile
              )
              editor.commands.clearContent()
              setIsSubmitting(false)
              router.refresh()
            }
          }}
        >
          <PaperAirplaneIcon className="m-2 h-8 w-8 text-orange-500 hover:cursor-pointer" />
        </IconButton>
      </div>
    </div>
  )
}
