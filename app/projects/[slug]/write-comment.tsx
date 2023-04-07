'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { sendComment } from '@/db/comment'
import { Profile } from '@/db/profile'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/db/supabase-provider'
import { Project } from '@/db/project'
import { useState } from 'react'
import { IconButton } from '@/components/button'
import { Row } from '@/components/layout/row'
import { Avatar } from '@/components/avatar'
import clsx from 'clsx'

export function WriteComment(props: {
  project: Project
  commenter: Profile
  replyingToId?: string
}) {
  const { project, commenter, replyingToId } = props
  const { supabase } = useSupabase()
  const editor = useTextEditor('')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Row className="w-full">
      <Avatar
        profile={commenter}
        size={replyingToId ? 6 : 10}
        className={clsx('mr-2', { 'ml-4 mt-1': replyingToId })}
      />
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
                if (
                  !content ||
                  content.length === 0 ||
                  !editor ||
                  !htmlContent
                ) {
                  return
                }
                await sendComment(
                  supabase,
                  content,
                  project.id,
                  commenter.id,
                  replyingToId
                )
                editor.commands.clearContent()
                setIsSubmitting(false)
                router.refresh()
              }
            }}
          >
            <PaperAirplaneIcon className="h-6 w-6 text-orange-500 hover:cursor-pointer hover:text-orange-600" />
          </IconButton>
        </div>
      </div>
    </Row>
  )
}
