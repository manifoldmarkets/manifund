import { SupabaseClient } from '@supabase/supabase-js'
import {
  requiresEin,
  type OrgAgreementValues,
  type RecipientEntityClass,
  type RecipientRelationship,
} from '@/db/grant_agreement'

const ENTITY_CLASSES: RecipientEntityClass[] = [
  'us_501c3',
  'us_nonprofit_other',
  'us_for_profit',
  'us_individual',
  'foreign_org',
  'foreign_individual',
]
const RELATIONSHIPS: RecipientRelationship[] = ['self', 'employer', 'fiscal_sponsor']

// Server-side mirror of validateRecipient in recipient-form.tsx. The client
// version exists for immediate feedback; this one is the enforcement, since the
// signing endpoints are reachable directly.
export function parseOrgValues(input: unknown): OrgAgreementValues | { error: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Missing recipient details.' }
  }
  const v = input as Record<string, unknown>
  const str = (key: string) => (typeof v[key] === 'string' ? (v[key] as string).trim() : '')

  const recipientName = str('recipientName')
  const recipientAddress = str('recipientAddress')
  const recipientCountry = str('recipientCountry')
  const signatoryName = str('signatoryName')
  const signatoryTitle = str('signatoryTitle')
  const projectLeadName = str('projectLeadName')
  const projectLeadOrg = str('projectLeadOrg')
  const recipientTaxId = str('recipientTaxId') || null
  const foreignNoTin = v.foreignNoTin === true
  const entityClass = ENTITY_CLASSES.find((c) => c === v.recipientEntityClass) ?? null
  const relationship = RELATIONSHIPS.find((r) => r === v.recipientRelationship) ?? null

  if (!recipientName) {
    return { error: 'Organization legal name is required.' }
  }
  if (!recipientAddress) {
    return { error: 'Organization address is required.' }
  }
  if (!recipientCountry) {
    return { error: 'Organization country is required.' }
  }
  if (!entityClass) {
    return { error: 'Entity type is required.' }
  }
  if (requiresEin(entityClass) && !recipientTaxId) {
    return { error: 'An EIN is required for US entities.' }
  }
  if (!requiresEin(entityClass) && !recipientTaxId && !foreignNoTin) {
    return { error: 'Provide an EIN, or confirm the entity has no US taxpayer ID.' }
  }
  if (!relationship) {
    return { error: 'Select how the organization relates to the project.' }
  }
  if (relationship !== 'self' && !projectLeadName) {
    return { error: 'Project lead name is required.' }
  }
  if (!signatoryName) {
    return { error: 'Signatory name is required.' }
  }
  if (!signatoryTitle) {
    return { error: 'Signatory title is required.' }
  }

  return {
    recipientName,
    recipientAddress,
    recipientCountry,
    recipientEntityClass: entityClass,
    recipientTaxId,
    foreignNoTin,
    recipientRelationship: relationship,
    projectLeadName,
    projectLeadOrg,
    signatoryName,
    signatoryTitle,
  }
}

// The public half of an org agreement: everything that appears in the rendered
// document and is therefore safe on the world-readable grant_agreements table.
export function orgAgreementColumns(values: OrgAgreementValues) {
  return {
    recipient_type: 'organization' as const,
    recipient_name: values.recipientName,
    recipient_address: values.recipientAddress,
    recipient_country: values.recipientCountry,
    recipient_entity_class: values.recipientEntityClass,
    recipient_relationship: values.recipientRelationship,
    project_lead_name: values.projectLeadName || null,
    project_lead_org: values.projectLeadOrg || null,
    signatory_name: values.signatoryName,
    signatory_title: values.signatoryTitle,
  }
}

// Requires an admin client: grant_agreement_private is RLS-locked to the
// service role, and (once 20260725000001 lands) so are writes to
// grant_agreements.
export async function upsertAgreementPrivate(
  supabaseAdmin: SupabaseClient,
  projectId: string,
  patch: Record<string, unknown>
) {
  await supabaseAdmin
    .from('grant_agreement_private')
    .upsert(
      { project_id: projectId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'project_id' }
    )
    .throwOnError()
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? null
}
