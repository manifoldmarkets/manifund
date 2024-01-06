'use client'

import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Dialog } from '@headlessui/react'
import { FireIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ReactivateButton(props: { projectId: string }) {
  const { projectId } = props
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <>
      <Button
        size="xl"
        className="mx-auto flex"
        onClick={() => {
          setModalOpen(true)
        }}
      >
        <FireIcon className="relative right-2 h-6 w-6" />
        Reactivate project
      </Button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <FireIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
        </div>
        <div className="my-3 text-center">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Reactivate project
          </Dialog.Title>
          <p className="my-2 text-sm text-gray-500">
            Your project will be moved into the active stage and remain eligible
            for trading and retroactive funding. It will not have an AMM.
          </p>
        </div>
        <div className="sm:flex-2 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            color={'gray'}
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const response = await fetch('/api/reactivate-project', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId,
                }),
              })
              setModalOpen(false)
              setIsSubmitting(false)
              router.refresh()
            }}
          >
            Reactivate
          </Button>
        </div>
      </Modal>
    </>
  )
}
