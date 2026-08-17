'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Checkbox, Input, RadioButton } from '@/components/input'
import { Select } from '@/components/select'
import {
  ENTITY_CLASS_LABELS,
  requiresEin,
  type OrgAgreementValues,
  type RecipientEntityClass,
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
  const selectedEntityLabel = values.recipient_entity_class
    ? ENTITY_CLASS_LABELS[values.recipient_entity_class]
    : 'Select…'
  const needsEin = requiresEin(values.recipient_entity_class)

  return (
    <Col className="gap-6 rounded-md border border-gray-300 p-5">
      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-name">
          Organization full legal name
        </label>
        <Input
          id="recipient-name"
          value={values.recipient_name}
          disabled={disabled}
          onChange={(e) => set({ recipient_name: e.target.value })}
          placeholder="Cherry Foundation, Inc."
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-address">
          Registered address
        </label>
        <Input
          id="recipient-address"
          value={values.recipient_address}
          disabled={disabled}
          onChange={(e) => set({ recipient_address: e.target.value })}
          placeholder="123 Main Street, Springfield, IL 62701"
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-country">
          Country
        </label>
        <Input
          id="recipient-country"
          value={values.recipient_country}
          disabled={disabled}
          onChange={(e) => set({ recipient_country: e.target.value })}
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
            const nextClass = (entry?.[0] as RecipientEntityClass) ?? null
            // The no-TIN checkbox is only shown for entity types that don't
            // require an EIN, so switching to one that does would otherwise
            // strand a checked box: the EIN field stays disabled with no way to
            // re-enable it, and validation then demands an EIN forever.
            set({
              recipient_entity_class: nextClass,
              foreign_no_tin: requiresEin(nextClass) ? false : values.foreign_no_tin,
            })
          }}
        />
      </Col>

      <Col className="gap-2">
        <label className="font-medium text-gray-900" htmlFor="recipient-ein">
          US EIN
        </label>
        <Input
          id="recipient-ein"
          value={values.recipient_tax_id ?? ''}
          disabled={disabled || values.foreign_no_tin}
          onChange={(e) => set({ recipient_tax_id: e.target.value })}
          placeholder="12-3456789"
        />
        {!needsEin && (
          <Row className="items-center gap-3">
            <Checkbox
              id="foreign-no-tin"
              checked={values.foreign_no_tin}
              disabled={disabled}
              onChange={(e) =>
                set({
                  foreign_no_tin: e.target.checked,
                  recipient_tax_id: e.target.checked ? null : values.recipient_tax_id,
                })
              }
            />
            <label htmlFor="foreign-no-tin" className="text-sm text-gray-900">
              This organization has no US taxpayer ID
            </label>
          </Row>
        )}
      </Col>

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
          value={values.signatory_name}
          disabled={disabled}
          onChange={(e) => set({ signatory_name: e.target.value })}
          placeholder="Carol Jones"
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
