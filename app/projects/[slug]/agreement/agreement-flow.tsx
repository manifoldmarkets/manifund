'use client'
import { Button } from '@/components/button'
import { Checkbox, RadioButton } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import {
  orgValuesFromAgreement,
  type GrantAgreement,
  type OrgAgreementValues,
  type RecipientType,
} from '@/db/grant_agreement'
import { type ProjectAndProfile } from '@/db/project'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { GrantAgreement as IndividualGrantAgreement } from './grant-agreement'
import { OrgGrantAgreement } from './org-grant-agreement'
import { RecipientForm, validateRecipient, type SignerChoice } from './recipient-form'
import { SignatureDisplay } from './signature-display'

const EMPTY_VALUES: OrgAgreementValues = {
  recipientName: '',
  recipientAddress: '',
  recipientCountry: '',
  recipientEntityClass: null,
  recipientTaxId: null,
  foreignNoTin: false,
  isFiscalSponsor: false,
  projectLeadName: '',
  projectLeadOrg: '',
  signatoryName: '',
}

// Owns the state for the whole /agreement page: which kind of recipient this
// grant is for, the entity details, and who signs. The document below the form
// re-renders live from this state, so the creator sees exactly the text that
// will be signed.
export function AgreementFlow(props: {
  project: ProjectAndProfile
  agreement?: GrantAgreement
  userIsOwner: boolean
  // Private fields, only passed for the creator and admins.
  signatoryEmail: string | null
  tokenSentTo: string | null
  tokenSentAt: string | null
}) {
  const {
    project,
    agreement,
    userIsOwner,
    signatoryEmail: initialSignatoryEmail,
    tokenSentTo,
    tokenSentAt,
  } = props
  const signed = !!agreement?.signed_at
  const router = useRouter()

  const [recipientType, setRecipientType] = useState<RecipientType>(
    agreement?.recipient_type ?? 'individual'
  )
  const [values, setValues] = useState<OrgAgreementValues>(
    agreement?.recipient_type === 'organization'
      ? orgValuesFromAgreement(agreement)
      : { ...EMPTY_VALUES, projectLeadName: project.profiles.full_name }
  )
  // A saved signatory email means the creator had chosen "someone else signs",
  // whether or not the link has gone out yet.
  const [signerChoice, setSignerChoice] = useState<SignerChoice>(
    tokenSentTo || initialSignatoryEmail ? 'someone_else' : 'self'
  )
  const [signatoryEmail, setSignatoryEmail] = useState(initialSignatoryEmail ?? '')
  const [attested, setAttested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedDraft, setSavedDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOrg = recipientType === 'organization'
  const editable = userIsOwner && !signed
  const excludeLobbyingClause = signed ? agreement.lobbying_clause_excluded : project.lobbying

  async function post(url: string, body: unknown) {
    setIsSubmitting(true)
    setError(null)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setIsSubmitting(false)
    if (!res.ok) {
      const message = await res.text()
      setError(message || 'Something went wrong. Please try again.')
      return false
    }
    return true
  }

  const orgPayload = {
    projectId: project.id,
    recipientType: 'organization' as const,
    values,
    signatoryEmail: signerChoice === 'someone_else' ? signatoryEmail : null,
  }

  async function signIndividual() {
    if (await post('/api/sign-grant-agreement', { projectId: project.id })) {
      router.push(`/projects/${project.slug}`)
    }
  }

  async function signAsOrg() {
    const problem = validateRecipient(values, signerChoice, signatoryEmail)
    if (problem) {
      setError(problem)
      return
    }
    if (await post('/api/sign-grant-agreement', { ...orgPayload, authorityAttested: true })) {
      router.push(`/projects/${project.slug}`)
    }
  }

  // Lets a half-filled form survive leaving the page; the sign and send paths
  // persist the same details themselves.
  async function saveDraft() {
    const problem = validateRecipient(values, signerChoice, signatoryEmail)
    if (problem) {
      setError(problem)
      return
    }
    if (
      await post('/api/save-agreement-recipient', {
        projectId: project.id,
        values,
        signatoryEmail: signerChoice === 'someone_else' ? signatoryEmail : null,
      })
    ) {
      setSavedDraft(true)
    }
  }

  async function sendForSignature() {
    const problem = validateRecipient(values, signerChoice, signatoryEmail)
    if (problem) {
      setError(problem)
      return
    }
    if (await post('/api/send-agreement-for-signature', orgPayload)) {
      router.refresh()
    }
  }

  return (
    <Col className="gap-10">
      {editable && (
        <Col className="gap-3">
          <span className="font-medium text-gray-900">Who is receiving this grant?</span>
          <Row className="items-center gap-3">
            <RadioButton
              id="recipient-individual"
              name="recipient-type"
              checked={!isOrg}
              onChange={() => setRecipientType('individual')}
            />
            <label htmlFor="recipient-individual" className="text-sm text-gray-900">
              Me, {project.profiles.full_name}
            </label>
          </Row>
          <Row className="items-center gap-3">
            <RadioButton
              id="recipient-org"
              name="recipient-type"
              checked={isOrg}
              onChange={() => setRecipientType('organization')}
            />
            <label htmlFor="recipient-org" className="text-sm text-gray-900">
              An organization — including a fiscal sponsor receiving funds on the project&apos;s
              behalf
            </label>
          </Row>
        </Col>
      )}

      {isOrg && editable && (
        <Col className="gap-3">
          <RecipientForm
            values={values}
            onChange={(next) => {
              setValues(next)
              setSavedDraft(false)
            }}
            signerChoice={signerChoice}
            onSignerChoiceChange={(choice) => {
              setSignerChoice(choice)
              setSavedDraft(false)
            }}
            signatoryEmail={signatoryEmail}
            onSignatoryEmailChange={setSignatoryEmail}
          />
          <Row className="items-center justify-end gap-3">
            {savedDraft && <span className="text-sm text-gray-500">Details saved.</span>}
            <Button color="gray" onClick={saveDraft} loading={isSubmitting}>
              Save details
            </Button>
          </Row>
        </Col>
      )}

      {isOrg ? (
        <OrgGrantAgreement
          project={project}
          values={values}
          excludeLobbyingClause={excludeLobbyingClause}
        />
      ) : (
        <IndividualGrantAgreement project={project} agreement={agreement} />
      )}

      <Col className="gap-10">
        {isOrg ? (
          <OrgSignatureBlock agreement={agreement} values={values} />
        ) : (
          <SignatureDisplay
            fullName={project.profiles.full_name}
            signatoryTitle="Recipient"
            signedAt={agreement?.signed_at ? new Date(agreement.signed_at) : undefined}
          />
        )}

        {editable && isOrg && signerChoice === 'someone_else' && (
          <Col className="gap-4">
            {tokenSentTo && (
              <div className="rounded-md bg-gray-100 p-4 text-sm text-gray-700">
                Signing link sent to <strong>{tokenSentTo}</strong>
                {tokenSentAt ? ` on ${format(new Date(tokenSentAt), 'MMMM do, yyyy')}` : ''}. The
                grant can&apos;t proceed until they sign. Editing the details above and sending
                again will invalidate the old link.
              </div>
            )}
            <Row className="justify-center">
              <Button onClick={sendForSignature} loading={isSubmitting}>
                {tokenSentTo ? 'Resend signing link' : 'Send for signature'}
              </Button>
            </Row>
          </Col>
        )}

        {editable && (!isOrg || signerChoice === 'self') && (
          <>
            <Row>
              <Checkbox
                id="terms"
                aria-describedby="terms-description"
                name="terms"
                checked={attested}
                onChange={(event) => setAttested(event.target.checked)}
              />
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="terms" className="font-medium text-gray-900">
                  {isOrg ? (
                    <>
                      I, <strong>{values.signatoryName || '[your name]'}</strong>, am authorized to
                      enter into this agreement on behalf of{' '}
                      <strong>{values.recipientName || '[organization]'}</strong>, and agree to the
                      terms of this grant as laid out in the above document.
                    </>
                  ) : (
                    <>
                      I, <strong>{project.profiles.full_name}</strong>, agree to the terms of this
                      grant as laid out in the above document.
                    </>
                  )}
                </label>
              </div>
            </Row>
            <Row className="mb-10 justify-center">
              <Button
                onClick={isOrg ? signAsOrg : signIndividual}
                loading={isSubmitting}
                disabled={!attested}
              >
                Submit signature
              </Button>
            </Row>
          </>
        )}

        {error && <p className="text-center text-sm text-rose-600">{error}</p>}

        <SignatureDisplay
          fullName={agreement?.profiles?.full_name ?? ''}
          signatoryTitle="Charity signatory"
          signedAt={agreement?.approved_at ? new Date(agreement.approved_at) : undefined}
        />
        <div>
          <span className="font-medium">This grant benefits the public by funding: </span>
          {project.public_benefit}
        </div>
      </Col>
    </Col>
  )
}

// The org signature block names the entity as the bound party and the human as
// the one signing for it, which a single "full name" line can't express.
function OrgSignatureBlock(props: { agreement?: GrantAgreement; values: OrgAgreementValues }) {
  const { agreement, values } = props
  const signedAt = agreement?.signed_at ? new Date(agreement.signed_at) : undefined
  // Today's date, for previewing an unsigned block. Set after mount rather than
  // during render: this component is server-rendered too, and a server in UTC
  // against a viewer in an earlier timezone would disagree about the date for
  // part of each day, which is a hydration mismatch.
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  const displayDate = signedAt ?? today
  return (
    <Col className="gap-4">
      <Col className="gap-2">
        <span className="font-medium">Recipient</span>
        <span className="h-6 border-b border-black">{values.recipientName}</span>
      </Col>
      <div className="flex flex-col gap-5 md:flex-row md:justify-between">
        {/* Everything previews live from the form, so the creator sees exactly
            what the executed block will say before committing to it. */}
        <Col className="gap-2">
          <span className="font-medium">By (signature)</span>
          <span className="h-6 w-52 border-b border-black font-satisfy">
            {values.signatoryName}
          </span>
        </Col>
        <Col className="gap-2">
          <span className="font-medium">Name</span>
          <span className="h-6 w-52 border-b border-black">{values.signatoryName}</span>
        </Col>
        <Col className="justify-between gap-2">
          <span className="font-medium">Date</span>
          <span className="h-6 w-52 border-b border-black">
            {displayDate ? format(displayDate, 'MMMM do, yyyy') : ''}
          </span>
        </Col>
      </div>
    </Col>
  )
}
