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
  const editor = useTextEditor('')

  return (
    <>
      <Button onClick={() => setOpen(true)}>🔔</Button>
      <Modal open={open}>
        <div className="p-3">
          <h1 className="text-lg font-semibold">Grant verdict</h1>
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
                      checked
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-white text-gray-900',
                      'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
                    )
                  }
                >
                  <RadioGroup.Label as="span">Reject</RadioGroup.Label>
                </RadioGroup.Option>
                <RadioGroup.Option
                  value={true}
                  className={({ checked }) =>
                    clsx(
                      'cursor-pointer focus:outline-none',
                      checked
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-white text-gray-900',
                      'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
                    )
                  }
                >
                  <RadioGroup.Label as="span">Approve</RadioGroup.Label>
                </RadioGroup.Option>
              </div>
            </RadioGroup>
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
                            }}
                          ></input>
                          <label>{message}</label>
                        </Row>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {(defaultMessage === 'custom' || approveGrant) && (
                <TextEditor editor={editor} />
              )}
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
