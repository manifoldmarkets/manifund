'use client'

import { Button } from '@/components/button'
import { TextEditor } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { Modal } from '@/components/modal'
import { useEditor } from '@tiptap/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GrantVerdict(props: { projectId: string }) {
  const { projectId } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const editor = useEditor()

  return (
    <>
      <Button
        // loading={isSubmitting}
        // onClick={async () => {
        //   setIsSubmitting(true)
        //   // TODO: create this function
        //   await fetch('/api/approveGrant', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(props
        //     ),
        //   })
        //   setIsSubmitting(false)
        //   router.refresh()
        // }}
        onClick={() => setOpen(true)}
      >
        🔔
      </Button>
      <Modal open={open}>
        <h1>Grant verdict</h1>
        <TextEditor editor={editor} />
        <Row className="justify-between">
          <Button
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              // TODO: create this function
              await fetch('/api/rejectGrant', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: projectId,
                  messageContent: editor?.getHTML(),
                }),
              })
              setIsSubmitting(false)
              setOpen(false)
              router.refresh()
            }}
          >
            ❌
          </Button>
          <Button
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              // TODO: create this function
              await fetch('/api/approveGrant', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: projectId,
                  messageContent: editor?.getHTML(),
                }),
              })
              setIsSubmitting(false)
              setOpen(false)
              router.refresh()
            }}
          >
            ✅
          </Button>
        </Row>
      </Modal>
    </>
  )
}
