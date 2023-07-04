'use client'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/input'
import { Row } from '@/components/layout/row'
import { ProjectAndProfile } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignAgreement(props: { project: ProjectAndProfile }) {
  const { project } = props
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <>
      <Row className="mb-3">
        <Row className="h-6 items-center">
          <Checkbox
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />
        </Row>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            I, <strong>{project.profiles.full_name}</strong>, agree to the terms
            of this grant as laid out in the above document.
          </label>
        </div>
      </Row>
      <Row className="justify-center">
        <Button
          onClick={async () => {
            setIsSubmitting(true)
            await fetch(`/api/sign-grant-agreement`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: project.id,
              }),
            })
            setIsSubmitting(false)
            router.push(`/projects/${project.slug}`)
          }}
          loading={isSubmitting}
          disabled={!agreed}
        >
          Submit Agreement
        </Button>
      </Row>
    </>
  )
}
