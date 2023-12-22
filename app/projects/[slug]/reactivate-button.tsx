'use client'

import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Tooltip } from '@/components/tooltip'
import { Cause } from '@/db/cause'
import { Project } from '@/db/project'
import { Dialog } from '@headlessui/react'
import { FireIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ReactivateButton(props: { project: Project }) {
  const { project } = props
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
              // TODO: Make different endpoint for this
              const response = await fetch('/api/move-cash-to-charity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
              })
              const json = await response.json()
              setModalOpen(false)
              setIsSubmitting(false)
              router.refresh()
            }}
          >
            Transfer money
          </Button>
        </div>
      </Modal>
    </>
  )
}

export function checkReactivationEligibility(
  project: Project,
  prizeCause?: Cause
) {
  if (
    project.stage === 'not funded' &&
    project.type === 'cert' &&
    !!prizeCause &&
    !!prizeCause.cert_params &&
    prizeCause.cert_params.judgeUnfundedProjects
  ) {
    return true
  }
  return false
}
