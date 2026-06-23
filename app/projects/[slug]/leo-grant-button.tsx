'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'

export function LeoGrantButton(props: { projectId: string }) {
  const { projectId } = props
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const placeOffer = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/leo-grant-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) {
        setErrorMessage((await res.text()) || 'Something went wrong.')
        return
      }
      setOpen(false)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        size="2xs"
        color="light-orange"
        className="flex items-center"
        onClick={() => setOpen(true)}
      >
        Leo $10k
      </Button>
      <Modal open={open} setOpen={setOpen}>
        <Col className="gap-4 p-3">
          <h2 className="text-lg font-semibold text-gray-900">Add Leo&apos;s $10k offer?</h2>
          <p className="text-gray-600">
            This places a $10,000 offer to donate from LeoGao on this project.
          </p>
          {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
          <Row className="justify-between">
            <Button color="gray-outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={placeOffer} loading={isSubmitting}>
              Add $10k offer
            </Button>
          </Row>
        </Col>
      </Modal>
    </>
  )
}
