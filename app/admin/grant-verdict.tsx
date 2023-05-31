'use client'

import { Button } from '@/components/button'
import { TextEditor, useTextEditor } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { Modal } from '@/components/modal'
import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DEFAULT_REJECT_MESSAGES = [
  "outside of Manifund's scope in terms of cause area and mission.",
  "outside of Manifund's scope legally.",
  'has downside risks that we believe make it net negative in expectation.',
  'custom',
]

export function GrantVerdict(props: { projectId: string }) {
  const { projectId } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approveGrant, setApproveGrant] = useState(false)
  const [defaultMessage, setDefaultMessage] = useState<string | null>(
    DEFAULT_REJECT_MESSAGES[0]
  )
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const editor = useTextEditor()
  console.log(approveGrant)

  return (
    <>
      <Button onClick={() => setOpen(true)}>🔔</Button>
      <Modal open={open}>
        <h1>Grant verdict</h1>
        <div>
          <RadioGroup
            value={approveGrant}
            onChange={setApproveGrant}
            className="mt-2"
          >
            <div className="flex max-w-fit rounded-md border border-gray-300 bg-white p-2">
              <RadioGroup.Option
                value={false}
                className={({ checked }) =>
                  clsx(
                    'cursor-pointer focus:outline-none',
                    checked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white',
                    'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
                  )
                }
              >
                <RadioGroup.Label as="span">❌</RadioGroup.Label>
              </RadioGroup.Option>
              <RadioGroup.Option
                value={true}
                className={({ checked }) =>
                  clsx(
                    'cursor-pointer focus:outline-none',
                    checked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white',
                    'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
                  )
                }
              >
                <RadioGroup.Label as="span">✅</RadioGroup.Label>
              </RadioGroup.Option>
            </div>
          </RadioGroup>
          {!approveGrant && (
            <RadioGroup
              value={defaultMessage}
              onChange={setDefaultMessage}
              className="mt-2"
            >
              <legend className="sr-only">Message choice</legend>
              <div className="space-y-4">
                {DEFAULT_REJECT_MESSAGES.map((message) => (
                  <Row className="items-center" key={message}>
                    <RadioGroup.Option
                      value={message}
                      defaultChecked={message === defaultMessage}
                      className={({ checked }) =>
                        clsx(
                          'cursor-pointer focus:outline-none',
                          checked
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-white',
                          'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
                        )
                      }
                      onChange={() => {
                        setDefaultMessage(message)
                      }}
                    >
                      <RadioGroup.Label as="span">{message}</RadioGroup.Label>
                    </RadioGroup.Option>
                  </Row>
                ))}
              </div>
            </RadioGroup>
          )}
          {defaultMessage === 'custom' && <TextEditor editor={editor} />}
        </div>
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
