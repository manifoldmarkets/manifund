'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Checkbox, Input, RadioButton } from '@/components/input'
import { Select } from '@/components/select'
import {
  ENTITY_CLASS_LABELS,
  RELATIONSHIP_LABELS,
  requiresEin,
  type OrgAgreementValues,
  type RecipientEntityClass,
  type RecipientRelationship,
} from '@/db/grant_agreement'

export type SignerChoice = 'self' | 'someone_else'

// Everything the creator fills in when the Recipient is an organization. The
// signatory can correct any of it on the signing page before signing, so this is
// a draft rather than an attestation by the creator.
export function RecipientForm(props: {
  values: OrgAgreementValues
  onChange: (values: OrgAgreementValues) => void
  signerChoice: SignerChoice
  onSignerChoiceChange: (choice: SignerChoice) => void
  signatoryEmail: string
  onSignatoryEmailChange: (email: string) => void
  // Hidden on the signing page, where the signatory is already known.
  showSignerChoice?: boolean
  disabled?: boolean
}) {
  const {
    values,
    onChange,
    signerChoice,
    onSignerChoiceChange,
    signatoryEmail,
    onSignatoryEmailChange,
    showSignerChoice = true,
    disabled,
  } = props
  const set = (patch: Partial<OrgAgreementValues>) => onChange({ ...values, ...patch })

  const entityClassOptions = Object.values(ENTITY_CLASS_LABELS)
  const selectedEntityLabel = values.recipientEntityClass
    ? ENTITY_CLASS_LABELS[values.recipientEntityClass]
    : 'Select…'
  const needsEin = requiresEin(values.recipientEntityClass)

  return (
    <Col className="gap-6 rounded-md border border-gray-300 p-5">
      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-name">
          Organization legal name
        </label>
        <p className="text-sm text-gray-500">
          The exact registered name, not a brand or DBA — this is the party bound by the agreement.
        </p>
        <Input
          id="recipient-name"
          value={values.recipientName}
          disabled={disabled}
          onChange={(e) => set({ recipientName: e.target.value })}
          placeholder="Cherry Foundation, Inc."
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-address">
          Registered address
        </label>
        <Input
          id="recipient-address"
          value={values.recipientAddress}
          disabled={disabled}
          onChange={(e) => set({ recipientAddress: e.target.value })}
          placeholder="123 Main Street, Springfield, IL 62701"
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-country">
          Country
        </label>
        <Input
          id="recipient-country"
          value={values.recipientCountry}
          disabled={disabled}
          onChange={(e) => set({ recipientCountry: e.target.value })}
          placeholder="United States"
        />
      </Col>

      <Col className="gap-2">
        <span className="font-medium text-gray-900">Entity type</span>
        <Select
          options={entityClassOptions}
          selected={selectedEntityLabel}
          onSelect={(label) => {
            const entry = Object.entries(ENTITY_CLASS_LABELS).find(([, v]) => v === label)
            set({ recipientEntityClass: (entry?.[0] as RecipientEntityClass) ?? null })
          }}
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-ein">
          EIN
        </label>
        <p className="text-sm text-gray-500">
          Kept private — it appears in your copy of the agreement and to Manifund staff, but not on
          the public project page.
        </p>
        <Input
          id="recipient-ein"
          value={values.recipientTaxId ?? ''}
          disabled={disabled || values.foreignNoTin}
          onChange={(e) => set({ recipientTaxId: e.target.value })}
          placeholder="12-3456789"
        />
        {!needsEin && (
          <Row className="items-center gap-3">
            <Checkbox
              id="foreign-no-tin"
              checked={values.foreignNoTin}
              disabled={disabled}
              onChange={(e) =>
                set({
                  foreignNoTin: e.target.checked,
                  recipientTaxId: e.target.checked ? null : values.recipientTaxId,
                })
              }
            />
            <label htmlFor="foreign-no-tin" className="text-sm text-gray-900">
              This organization has no US taxpayer ID (we&apos;ll ask for a Form W-8 separately)
            </label>
          </Row>
        )}
      </Col>

      <Col className="gap-2">
        <span className="font-medium text-gray-900">
          How does this organization relate to the project?
        </span>
        {(Object.keys(RELATIONSHIP_LABELS) as RecipientRelationship[]).map((rel) => (
          <Row key={rel} className="items-center gap-3">
            <RadioButton
              id={`relationship-${rel}`}
              name="relationship"
              checked={values.recipientRelationship === rel}
              disabled={disabled}
              onChange={() => set({ recipientRelationship: rel })}
            />
            <label htmlFor={`relationship-${rel}`} className="text-sm text-gray-900">
              {RELATIONSHIP_LABELS[rel]}
            </label>
          </Row>
        ))}
      </Col>

      {values.recipientRelationship && values.recipientRelationship !== 'self' && (
        <>
          <Col className="gap-2">
            <label className="font-medium text-gray-900" htmlFor="project-lead-name">
              Project lead
            </label>
            <p className="text-sm text-gray-500">
              Who actually runs the project. Named in the agreement so the clauses about doing the
              work point at the right person.
            </p>
            <Input
              id="project-lead-name"
              value={values.projectLeadName}
              disabled={disabled}
              onChange={(e) => set({ projectLeadName: e.target.value })}
              placeholder="Alice Smith"
            />
          </Col>
          <Col className="gap-2">
            <label className="font-medium text-gray-900" htmlFor="project-lead-org">
              Project lead&apos;s organization <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              id="project-lead-org"
              value={values.projectLeadOrg}
              disabled={disabled}
              onChange={(e) => set({ projectLeadOrg: e.target.value })}
              placeholder="Acme Labs"
            />
          </Col>
        </>
      )}

      {showSignerChoice && (
        <Col className="gap-3 border-t border-gray-200 pt-6">
          <span className="font-medium text-gray-900">Who will sign for the organization?</span>
          <Row className="items-center gap-3">
            <RadioButton
              id="signer-self"
              name="signer"
              checked={signerChoice === 'self'}
              disabled={disabled}
              onChange={() => onSignerChoiceChange('self')}
            />
            <label htmlFor="signer-self" className="text-sm text-gray-900">
              I&apos;m authorized to sign for this organization
            </label>
          </Row>
          <Row className="items-center gap-3">
            <RadioButton
              id="signer-else"
              name="signer"
              checked={signerChoice === 'someone_else'}
              disabled={disabled}
              onChange={() => onSignerChoiceChange('someone_else')}
            />
            <label htmlFor="signer-else" className="text-sm text-gray-900">
              Someone else must sign — we&apos;ll email them a signing link
            </label>
          </Row>
        </Col>
      )}

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="signatory-name">
          {signerChoice === 'self' ? 'Your name' : 'Signatory name'}
        </label>
        <Input
          id="signatory-name"
          value={values.signatoryName}
          disabled={disabled}
          onChange={(e) => set({ signatoryName: e.target.value })}
          placeholder="Carol Jones"
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="signatory-title">
          {signerChoice === 'self' ? 'Your title' : 'Signatory title'}
        </label>
        <p className="text-sm text-gray-500">
          Authority to bind the organization is read off this — e.g. Executive Director, Managing
          Partner.
        </p>
        <Input
          id="signatory-title"
          value={values.signatoryTitle}
          disabled={disabled}
          onChange={(e) => set({ signatoryTitle: e.target.value })}
          placeholder="Executive Director"
        />
      </Col>

      {showSignerChoice && signerChoice === 'someone_else' && (
        <Col className="gap-2">
          <label className="font-medium text-gray-900" htmlFor="signatory-email">
            Signatory email
          </label>
          <p className="text-sm text-gray-500">
            We&apos;ll send the signing link here. This address is the record of who signed, so use
            their real work address.
          </p>
          <Input
            id="signatory-email"
            type="email"
            value={signatoryEmail}
            disabled={disabled}
            onChange={(e) => onSignatoryEmailChange(e.target.value)}
            placeholder="carol@cherryfoundation.org"
          />
        </Col>
      )}
    </Col>
  )
}

// Required before an org agreement can be signed or sent out. Returns a
// human-readable reason, or null when the form is complete.
export function validateRecipient(
  values: OrgAgreementValues,
  signerChoice: SignerChoice,
  signatoryEmail: string
) {
  if (!values.recipientName.trim()) {
    return 'Enter the organization’s legal name.'
  }
  if (!values.recipientAddress.trim()) {
    return 'Enter the organization’s registered address.'
  }
  if (!values.recipientCountry.trim()) {
    return 'Enter the organization’s country.'
  }
  if (!values.recipientEntityClass) {
    return 'Select the organization’s entity type.'
  }
  if (requiresEin(values.recipientEntityClass) && !values.recipientTaxId?.trim()) {
    return 'Enter the organization’s EIN.'
  }
  if (
    !requiresEin(values.recipientEntityClass) &&
    !values.foreignNoTin &&
    !values.recipientTaxId?.trim()
  ) {
    return 'Enter an EIN, or confirm the organization has no US taxpayer ID.'
  }
  if (!values.recipientRelationship) {
    return 'Select how the organization relates to the project.'
  }
  if (values.recipientRelationship !== 'self' && !values.projectLeadName.trim()) {
    return 'Enter the project lead’s name.'
  }
  if (!values.signatoryName.trim()) {
    return 'Enter the signatory’s name.'
  }
  if (!values.signatoryTitle.trim()) {
    return 'Enter the signatory’s title.'
  }
  if (signerChoice === 'someone_else' && !signatoryEmail.trim()) {
    return 'Enter the signatory’s email address.'
  }
  return null
}
