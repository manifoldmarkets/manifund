import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Vocabularies for the org-recipient columns. Enforced by CHECK constraints in
// supabase/migrations/20260725000000_org_grant_agreements.sql; kept as unions
// here so the UI is typed.
export type RecipientType = 'individual' | 'organization'

export type RecipientEntityClass =
  | 'us_501c3'
  | 'us_nonprofit_other'
  | 'us_for_profit'
  | 'us_individual'
  | 'foreign_org'
  | 'foreign_individual'

// How the Recipient relates to whoever actually performs the Project.
export type RecipientRelationship = 'self' | 'employer' | 'fiscal_sponsor'

export const ENTITY_CLASS_LABELS: Record<RecipientEntityClass, string> = {
  us_501c3: 'US 501(c)(3)',
  us_nonprofit_other: 'US nonprofit (not 501(c)(3))',
  us_for_profit: 'US for-profit',
  us_individual: 'US individual',
  foreign_org: 'Non-US organization',
  foreign_individual: 'Non-US individual',
}

export const RELATIONSHIP_LABELS: Record<RecipientRelationship, string> = {
  self: 'The organization is running the project itself',
  employer: 'The project lead works for the organization',
  fiscal_sponsor: 'The organization is the project lead’s fiscal sponsor',
}

// A US EIN is required unless the entity is foreign (which needs a W-8 instead).
export function requiresEin(entityClass: RecipientEntityClass | null) {
  return (
    entityClass === 'us_501c3' ||
    entityClass === 'us_nonprofit_other' ||
    entityClass === 'us_for_profit'
  )
}

// TODO: delete this block once `bun run gen-types` has been re-run against a
// database with 20260725000000_org_grant_agreements.sql applied. Until the
// migration is pushed to prod, the generated Row type is missing these columns,
// so they're declared by hand and intersected in below.
type OrgAgreementColumns = {
  recipient_type: RecipientType
  recipient_address: string | null
  recipient_country: string | null
  recipient_entity_class: RecipientEntityClass | null
  recipient_relationship: RecipientRelationship | null
  project_lead_name: string | null
  project_lead_org: string | null
  signatory_title: string | null
  signatory_authority_attested: boolean
  org_agreement_version: number | null
}

type GrantAgreementRow = Database['public']['Tables']['grant_agreements']['Row'] &
  OrgAgreementColumns

export type GrantAgreement = GrantAgreementRow & {
  profiles: { full_name: string; username: string }
}

// Sensitive counterpart to grant_agreements. Service-role access only: RLS on
// this table is enabled with no policies, so an anon/authenticated client sees
// nothing. Never pass a whole row of this to a client component.
export type GrantAgreementPrivate = {
  project_id: string
  recipient_tax_id: string | null
  foreign_no_tin: boolean
  signatory_email: string | null
  signing_token_hash: string | null
  token_sent_to: string | null
  token_sent_at: string | null
  token_expires_at: string | null
  signed_ip: string | null
  signed_user_agent: string | null
  rendered_document: string | null
  w9_received_at: string | null
  w8_received_at: string | null
  determination_letter_on_file: boolean
  foreign_withholding_flag: boolean
  created_at: string
  updated_at: string
}

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
export type OrgAgreementValues = {
  recipientName: string
  recipientAddress: string
  recipientCountry: string
  recipientEntityClass: RecipientEntityClass | null
  // Null for public viewers — the EIN lives in grant_agreement_private and is
  // only passed to the creator, the signatory, and admins. The document renders
  // "EIN on file with the Charity" in its place.
  recipientTaxId: string | null
  foreignNoTin: boolean
  recipientRelationship: RecipientRelationship | null
  projectLeadName: string
  projectLeadOrg: string
  signatoryName: string
  signatoryTitle: string
}

export function orgValuesFromAgreement(
  agreement: GrantAgreement,
  taxId: string | null
): OrgAgreementValues {
  return {
    recipientName: agreement.recipient_name ?? '',
    recipientAddress: agreement.recipient_address ?? '',
    recipientCountry: agreement.recipient_country ?? '',
    recipientEntityClass: agreement.recipient_entity_class,
    recipientTaxId: taxId,
    foreignNoTin: !taxId,
    recipientRelationship: agreement.recipient_relationship,
    projectLeadName: agreement.project_lead_name ?? '',
    projectLeadOrg: agreement.project_lead_org ?? '',
    signatoryName: agreement.signatory_name ?? '',
    signatoryTitle: agreement.signatory_title ?? '',
  }
}
