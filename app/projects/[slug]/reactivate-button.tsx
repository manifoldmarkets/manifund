'use client'

import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Cause } from '@/db/cause'
import { Project } from '@/db/project'
import { FireIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export function ReactivateButton(props: { project: Project }) {
  const { project } = props
  const [modalOpen, setModalOpen] = useState(false)
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
        Reactivation confirmation modal
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
