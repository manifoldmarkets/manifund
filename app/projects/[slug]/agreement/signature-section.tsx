'use client'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/input'
import { Row } from '@/components/layout/row'
import { GrantAgreement } from '@/db/grant_agreement'
import { ProjectAndProfile } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SignatureDisplay } from './signature-display'

export function SignatureSection(props: {
  project: ProjectAndProfile
  agreement: GrantAgreement
  userIsOwner: boolean
}) {
  const { project, agreement, userIsOwner } = props
  const [signedAt, setSignedAt] = useState(
    agreement.signed_at ? new Date(agreement.signed_at) : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  return (
    <>
      <SignatureDisplay
        fullName={project.profiles.full_name}
        signatoryTitle="Recipient"
        signedAt={signedAt}
      />
      {!agreement.signed_at && userIsOwner && (
        <Row className="mb-3">
          <Checkbox
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            checked={!!signedAt}
            onChange={(event) =>
              setSignedAt(event.target.checked ? new Date() : undefined)
            }
          />
          <div className="ml-3 text-sm leading-6">
            <label htmlFor="terms" className="font-medium text-gray-900">
              I, <strong>{project.profiles.full_name}</strong>, agree to the
              terms of this grant as laid out in the above document.
            </label>
          </div>
        </Row>
      )}
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
            disabled={!signedAt}
          >
            Submit signature
          </Button>
        </Row>
      )}
      <SignatureDisplay
        fullName={agreement.profiles?.full_name ?? ''}
        signatoryTitle="Manifund signatory"
        signedAt={
          agreement.approved_at ? new Date(agreement.approved_at) : undefined
        }
      />
    </>
  )
}
