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
  const editor = useTextEditor('', 'border-0 focus:!outline-none focus:ring-0')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Row className="w-full">
      <Avatar
        username={commenter.username}
        avatarUrl={commenter.avatar_url}
        size={replyingToId ? 6 : 10}
        className="mr-2"
      />
      <div className="w-full overflow-hidden rounded-md border border-gray-300 shadow">
        <TextEditor editor={editor}>
          {/* Spacer element to match the height of the toolbar */}
          <div className="py-1" aria-hidden="true">
            {/* Matches height of button in toolbar (1px border + 36px content height) */}
            <div className="py-px">
              <div className="h-9" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-end py-1 pl-3">
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
        </TextEditor>
      </div>
    </Row>
  )
}
