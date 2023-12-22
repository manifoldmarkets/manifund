'use client'

import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Cause } from '@/db/cause'
import { FullProject, Project } from '@/db/project'
import { useState } from 'react'

export function ReactivateButton(props: { project: Project }) {
  const { project } = props
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <Button
        size="sm"
        className="mr-2"
        onClick={() => {
          setModalOpen(true)
        }}
      >
        Reactivate
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
    prizeCause &&
    prizeCause.cert_params &&
    prizeCause.cert_params.judgeUnfundedProjects
  ) {
    return true
  }
  return false
}
