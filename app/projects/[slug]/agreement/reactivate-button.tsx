'use client'

import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { FullProject } from '@/db/project'
import { useState } from 'react'

export function ReactivateButton(props: { project: FullProject }) {
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
