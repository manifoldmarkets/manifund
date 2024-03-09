'use client'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/input'
import { Row } from '@/components/layout/row'
import { ProjectAndProfile } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignAgreement(props: {
  project: ProjectAndProfile
  userIsOwner: boolean
}) {
  const { project, userIsOwner } = props
  const [agreed, setAgreed] = useState(project.signed_agreement)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <>
      <Row className="mb-3">
        <Checkbox
          id="terms"
          aria-describedby="terms-description"
          name="terms"
          disabled={agreed || !userIsOwner}
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            I, <strong>{project.profiles.full_name}</strong>, agree to the terms
            of this grant as laid out in the above document.
          </label>
          {/* Show the signatures below, in the Caveat font */}
          <div className="mt-3 font-caveat text-2xl">
            <div className="flex justify-between">
              <div className="w-1/3 border-b-2 border-black">
                {project.profiles.full_name}
              </div>
              <div className="w-1/3 border-b-2 border-black">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mt-3 font-caveat text-2xl">
            <div className="flex justify-between">
              <div className="w-1/3 border-b-2 border-black">Austin Chen</div>
              <div className="w-1/3 border-b-2 border-black">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Row>
      {!project.signed_agreement && userIsOwner && (
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
      )}
    </>
  )
}
