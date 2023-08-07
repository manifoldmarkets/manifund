'use client'

import { Button } from '@/components/button'
import { TextEditor } from '@/components/editor'
import { useTextEditor } from '@/hooks/use-text-editor'
import { Row } from '@/components/layout/row'
import { Modal } from '@/components/modal'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const REJECT_MESSAGE_INTRO =
  'Manifund has declined to fund this project because we believe it'

const DEFAULT_REJECT_MESSAGES = [
  'is outside of our scope in terms of cause area and mission.',
  'is outside of our scope legally.',
  'has downside risks that we believe make it net negative in expectation.',
  'custom',
]

export function GrantVerdict(props: { projectId: string }) {
  const { projectId } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approveGrant, setApproveGrant] = useState(false)
  const [defaultMessage, setDefaultMessage] = useState<string | null>('custom')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const editor = useTextEditor(
    `${REJECT_MESSAGE_INTRO} ${
      defaultMessage === 'custom' ? '...' : defaultMessage
    }`
  )
  const verdictOptions = {
    approve: 'Approve',
    reject: 'Reject',
  }

  useEffect(() => {
    if (approveGrant) {
      editor?.commands.setContent('')
    }
  }, [approveGrant])
  return (
    <>
      <Button onClick={() => setOpen(true)}>🔔</Button>
      <Modal open={open}>
        <div className="p-3">
          <h1 className="text-lg font-semibold">Grant verdict</h1>
          <div>
            <HorizontalRadioGroup
              value={approveGrant ? 'approve' : 'reject'}
              onChange={(event) => setApproveGrant(event === 'approve')}
              options={verdictOptions}
            />
            <div className="my-5">
              <p>Reason for verdict:</p>
              <p className="text-sm text-gray-500">
                This will be posted as an admin comment on the project page.
                Nothing will be posted if this is left empty.
              </p>
              {!approveGrant && (
                <div className="my-5">
                  <fieldset className="mt-2">
                    <legend className="sr-only">Message choice</legend>
                    <div className="space-y-4">
                      {DEFAULT_REJECT_MESSAGES.map((message) => (
                        <Row className="gap-2" key={message}>
                          <input
                            type="radio"
                            value={message}
                            defaultChecked={message === defaultMessage}
                            checked={message === defaultMessage}
                            className="relative top-1 h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-600"
                            onChange={() => {
                              setDefaultMessage(message)
                              editor?.commands.setContent(
                                `<p>Manifund has declined to fund this project because we believe it ${
                                  message === 'custom' ? '...' : message
                                }</p>`
                              )
                            }}
                          ></input>
                          <label>{message}</label>
                        </Row>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}
              <TextEditor editor={editor} />
            </div>
          </div>
          <Row className="justify-between">
            <Button
              color="gray-outline"
              loading={isSubmitting}
              onClick={() => {
                console.log(editor?.getJSON())
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              loading={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true)
                await fetch('/api/issue-grant-verdict', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    approved: approveGrant,
                    projectId: projectId,
                    // TODO: account for default message case
                    adminComment:
                      editor?.getHTML() === '<p></p>'
                        ? null
                        : editor?.getJSON(),
                  }),
                })
                setIsSubmitting(false)
                setOpen(false)
                router.refresh()
              }}
            >
              Submit
            </Button>
          </Row>
        </div>
      </Modal>
    </>
  )
}
