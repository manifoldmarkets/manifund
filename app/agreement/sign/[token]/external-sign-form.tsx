'use client'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { type OrgAgreementValues } from '@/db/grant_agreement'
import { type ProjectAndProfile } from '@/db/project'
import { useState } from 'react'
import { OrgGrantAgreement } from '@/app/projects/[slug]/agreement/org-grant-agreement'
import { RecipientForm, validateRecipient } from '@/app/projects/[slug]/agreement/recipient-form'

// The signatory's view: the same form the creator drafted, editable, so the
// person actually bound by the agreement can correct their organization's legal
// name or their own title before signing rather than inheriting someone else's
// guess.
export function ExternalSignForm(props: {
  token: string
  project: ProjectAndProfile
  initialValues: OrgAgreementValues
}) {
  const { token, project, initialValues } = props
  const [values, setValues] = useState(initialValues)
  const [attested, setAttested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function sign() {
    const problem = validateRecipient(values, 'self', '')
    if (problem) {
      setError(problem)
      return
    }
    setIsSubmitting(true)
    setError(null)
    const res = await fetch('/api/sign-grant-agreement-external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, values, authorityAttested: true }),
    })
    setIsSubmitting(false)
    if (!res.ok) {
      setError((await res.text()) || 'Something went wrong. Please try again.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Col className="gap-3 rounded-md bg-orange-50 p-6">
        <h2 className="text-lg font-semibold">Signed — thank you</h2>
        <p className="text-gray-700">
          A copy of the signed agreement is on its way to your inbox, and{' '}
          {project.profiles.full_name} has been notified.
        </p>
      </Col>
    )
  }

  return (
    <Col className="gap-10">
      <RecipientForm
        values={values}
        onChange={setValues}
        signerChoice="self"
        onSignerChoiceChange={() => {}}
        signatoryEmail=""
        onSignatoryEmailChange={() => {}}
        showSignerChoice={false}
      />

      <OrgGrantAgreement
        project={project}
        values={values}
        excludeLobbyingClause={project.lobbying}
      />

      <Row>
        <Checkbox
          id="terms"
          name="terms"
          checked={attested}
          onChange={(event) => setAttested(event.target.checked)}
        />
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            I, <strong>{values.signatoryName || '[your name]'}</strong>,{' '}
            {values.signatoryTitle || '[your title]'} of{' '}
            <strong>{values.recipientName || '[organization]'}</strong>, am authorized to enter into
            this agreement on its behalf, and agree to the terms of this grant as laid out in the
            above document.
          </label>
        </div>
      </Row>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Row className="mb-10 justify-center">
        <Button onClick={sign} loading={isSubmitting} disabled={!attested}>
          Sign agreement
        </Button>
      </Row>
    </Col>
  )
}
