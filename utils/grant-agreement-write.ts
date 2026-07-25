import { SupabaseClient } from '@supabase/supabase-js'
import {
  requiresEin,
  type OrgAgreementValues,
  type RecipientEntityClass,
} from '@/db/grant_agreement'

const ENTITY_CLASSES: RecipientEntityClass[] = [
  'us_501c3',
  'us_nonprofit_other',
  'us_for_profit',
  'foreign_org',
]

// Sanitizes whatever the client sent, without judging completeness.
function extractOrgValues(input: unknown): OrgAgreementValues {
  const v = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const str = (key: string) => (typeof v[key] === 'string' ? (v[key] as string).trim() : '')
  return {
    recipientName: str('recipientName'),
    recipientAddress: str('recipientAddress'),
    recipientCountry: str('recipientCountry'),
    recipientEntityClass: ENTITY_CLASSES.find((c) => c === v.recipientEntityClass) ?? null,
    recipientTaxId: str('recipientTaxId') || null,
    foreignNoTin: v.foreignNoTin === true,
    signatoryName: str('signatoryName'),
  }
}

// Server-side mirror of validateRecipient in recipient-form.tsx. The client
// version exists for immediate feedback; this one is the enforcement, since the
// signing endpoints are reachable directly.
export function parseOrgValues(input: unknown): OrgAgreementValues | { error: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Missing recipient details.' }
  }
  const {
    recipientName,
    recipientAddress,
    recipientCountry,
    recipientEntityClass: entityClass,
    recipientTaxId,
    foreignNoTin,
    signatoryName,
  } = extractOrgValues(input)

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
  if (!signatoryName) {
    return { error: 'Signatory name is required.' }
  }

  return {
    recipientName,
    recipientAddress,
    recipientCountry,
    recipientEntityClass: entityClass,
    recipientTaxId,
    foreignNoTin,
    signatoryName,
  }
}

// Everything that appears in the rendered document. All of it lives on the
// world-readable grant_agreements table, the EIN included: it identifies the
// contracting party in the published agreement.
export function orgAgreementColumns(values: OrgAgreementValues) {
  return {
    recipient_type: 'organization' as const,
    recipient_name: values.recipientName,
    recipient_address: values.recipientAddress,
    recipient_country: values.recipientCountry,
    recipient_entity_class: values.recipientEntityClass,
    recipient_tax_id: values.recipientTaxId,
    foreign_no_tin: values.foreignNoTin,
    signatory_name: values.signatoryName,
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
