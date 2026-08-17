import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Vocabularies for the org-recipient columns. Enforced by CHECK constraints in
// supabase/migrations/20260725000000_org_grant_agreements.sql; kept as unions
// here so the UI is typed.
export type RecipientType = 'individual' | 'organization'

// Organizations only — this vocabulary is only ever asked for when the
// recipient is an organization, so there are no individual classifications.
export type RecipientEntityClass =
  | 'us_501c3'
  | 'us_nonprofit_other'
  | 'us_for_profit'
  | 'foreign_org'

export const ENTITY_CLASS_LABELS: Record<RecipientEntityClass, string> = {
  us_501c3: 'US 501(c)(3)',
  us_nonprofit_other: 'US nonprofit (not 501(c)(3))',
  us_for_profit: 'US for-profit',
  foreign_org: 'Non-US organization',
}

// Every US entity has an EIN. Non-US organizations generally don't, and provide
// a Form W-8 instead.
export function requiresEin(entityClass: RecipientEntityClass | null) {
  return entityClass !== null && entityClass !== 'foreign_org'
}

// The generated Row types the vocabulary columns as plain strings; narrow them
// to the unions the CHECK constraints enforce.
type GrantAgreementRow = Omit<
  Database['public']['Tables']['grant_agreements']['Row'],
  'recipient_type' | 'recipient_entity_class'
> & {
  recipient_type: RecipientType
  recipient_entity_class: RecipientEntityClass | null
}

export type GrantAgreement = GrantAgreementRow & {
  profiles: { full_name: string; username: string }
}

// Sensitive counterpart to grant_agreements. Service-role access only: RLS on
// this table is enabled with no policies, so an anon/authenticated client sees
// nothing. Never pass a whole row of this to a client component.
export type GrantAgreementPrivate = Database['public']['Tables']['grant_agreement_private']['Row']

export async function getGrantAgreement(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('grant_agreements')
    .select('*, profiles(full_name, username)')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) {
    console.error(error)
    throw error
  }
  return data as GrantAgreement | null
}

// Requires an admin (service-role) client.
export async function getGrantAgreementPrivate(supabaseAdmin: SupabaseClient, projectId: string) {
  const { data } = await supabaseAdmin
    .from('grant_agreement_private')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()
    .throwOnError()
  return (data as GrantAgreementPrivate | null) ?? null
}

// Looks up a pending signature request by the sha256 of its token. Requires an
// admin client. Returns null for an unknown or expired token; callers must not
// distinguish the two in what they render.
export async function getAgreementBySigningTokenHash(
  supabaseAdmin: SupabaseClient,
  tokenHash: string
) {
  const { data } = await supabaseAdmin
    .from('grant_agreement_private')
    .select('*')
    .eq('signing_token_hash', tokenHash)
    .maybeSingle()
    .throwOnError()
  const priv = data as GrantAgreementPrivate | null
  if (!priv) {
    return null
  }
  if (priv.token_expires_at && new Date(priv.token_expires_at) < new Date()) {
    return null
  }
  return priv
}

// What the agreement document needs in order to render. Assembled either from a
// saved agreement row (once details are drafted or signed) or from live form
// state (while the creator is still filling it in), so the preview and the
// signed artifact go through exactly one code path.
//
// Keys are the grant_agreements column names, so a complete value spreads
// straight into an upsert and there's no camelCase twin to keep in sync.
export type OrgAgreementValues = {
  recipient_name: string
  recipient_address: string
  recipient_country: string
  recipient_entity_class: RecipientEntityClass | null
  recipient_tax_id: string | null
  foreign_no_tin: boolean
  signatory_name: string
}

// Same columns, minus the row's nulls: the form wants '' for empty text fields.
export function orgValuesFromAgreement(agreement: GrantAgreement): OrgAgreementValues {
  return {
    recipient_name: agreement.recipient_name ?? '',
    recipient_address: agreement.recipient_address ?? '',
    recipient_country: agreement.recipient_country ?? '',
    recipient_entity_class: agreement.recipient_entity_class,
    recipient_tax_id: agreement.recipient_tax_id,
    foreign_no_tin: agreement.foreign_no_tin,
    signatory_name: agreement.signatory_name ?? '',
  }
}

const ENTITY_CLASSES: RecipientEntityClass[] = [
  'us_501c3',
  'us_nonprofit_other',
  'us_for_profit',
  'foreign_org',
]

// Sanitizes untrusted input into the values shape, without judging completeness.
function extractOrgValues(input: unknown): OrgAgreementValues {
  const v = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const str = (key: string) => (typeof v[key] === 'string' ? (v[key] as string).trim() : '')
  return {
    recipient_name: str('recipient_name'),
    recipient_address: str('recipient_address'),
    recipient_country: str('recipient_country'),
    recipient_entity_class: ENTITY_CLASSES.find((c) => c === v.recipient_entity_class) ?? null,
    recipient_tax_id: str('recipient_tax_id') || null,
    foreign_no_tin: v.foreign_no_tin === true,
    signatory_name: str('signatory_name'),
  }
}

// The single source of validation for org recipient details. The form calls it
// for immediate feedback; the signing endpoints call it as the enforcement,
// since they're reachable directly. Returns the sanitized values, or a
// human-readable reason the input is incomplete.
export function parseOrgValues(input: unknown): OrgAgreementValues | { error: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Missing recipient details.' }
  }
  const values = extractOrgValues(input)
  if (!values.recipient_name) {
    return { error: 'Enter the organization’s legal name.' }
  }
  if (!values.recipient_address) {
    return { error: 'Enter the organization’s registered address.' }
  }
  if (!values.recipient_country) {
    return { error: 'Enter the organization’s country.' }
  }
  if (!values.recipient_entity_class) {
    return { error: 'Select the organization’s entity type.' }
  }
  if (requiresEin(values.recipient_entity_class) && !values.recipient_tax_id) {
    return { error: 'Enter the organization’s EIN.' }
  }
  if (
    !requiresEin(values.recipient_entity_class) &&
    !values.recipient_tax_id &&
    !values.foreign_no_tin
  ) {
    return { error: 'Enter an EIN, or confirm the organization has no US taxpayer ID.' }
  }
  if (!values.signatory_name) {
    return { error: 'Enter the signatory’s name.' }
  }
  return values
}
