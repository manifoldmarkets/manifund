import { getProjectAndProfileById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { maybeActivateProject } from '@/utils/activate-project'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { CURRENT_AGREEMENT_VERSION, CURRENT_ORG_AGREEMENT_VERSION } from '@/utils/constants'
import {
  clientIp,
  orgAgreementColumns,
  parseOrgValues,
  upsertAgreementPrivate,
} from '@/utils/grant-agreement-write'
import {
  agreementEmailHtml,
  renderIndividualAgreementHtml,
  renderOrgAgreementHtml,
} from '@/utils/render-agreement'
import { type GrantAgreement } from '@/db/grant_agreement'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Signing by the project creator: either personally, or as an authorized
// representative of a recipient organization. When the organization's signatory
// is someone else, the creator never lands here — see
// send-agreement-for-signature.ts and sign-grant-agreement-external.ts.
export default async function handler(req: NextRequest) {
  const { projectId, recipientType, values, authorityAttested } = await req.json()
  const { supabase, user } = await getUserAndClient(req)
  const project = await getProjectAndProfileById(supabase, projectId)
  if (!project || user?.id !== project.creator) {
    return Response.error()
  }

  const isOrg = recipientType === 'organization'
  const parsed = isOrg ? parseOrgValues(values) : null
  if (parsed && 'error' in parsed) {
    return new Response(parsed.error, { status: 400 })
  }
  if (isOrg && !authorityAttested) {
    return new Response(
      'The signatory must confirm they are authorized to bind the organization.',
      {
        status: 400,
      }
    )
  }

  // Writes go through the service role: grant_agreement_private is RLS-locked
  // to it, and grant_agreements writes are locked down by migration
  // 20260725000001 to close the "any authenticated user can overwrite any
  // agreement" hole.
  const supabaseAdmin = createAdminClient()
  const signedAt = new Date().toISOString()

  await supabaseAdmin
    .from('projects')
    .update({ signed_agreement: true })
    .eq('id', projectId)
    .throwOnError()

  const { data: agreementRows } = await supabaseAdmin
    .from('grant_agreements')
    .upsert(
      {
        project_id: projectId,
        signed_at: signedAt,
        project_description: project.description,
        project_title: project.title,
        lobbying_clause_excluded: project.lobbying,
        ...(parsed
          ? {
              ...orgAgreementColumns(parsed),
              signatory_authority_attested: true,
              org_agreement_version: CURRENT_ORG_AGREEMENT_VERSION,
              version: null,
            }
          : {
              recipient_type: 'individual',
              recipient_name: project.profiles.full_name,
              signatory_name: project.profiles.full_name,
              version: CURRENT_AGREEMENT_VERSION,
            }),
      },
      { onConflict: 'project_id' }
    )
    .select('*, profiles(full_name, username)')
    .throwOnError()

  // Cast because database.types.ts doesn't yet know about the org columns; see
  // the shim note in db/grant_agreement.ts.
  const agreement = agreementRows?.[0] as GrantAgreement | undefined
  const documentHtml = parsed
    ? renderOrgAgreementHtml({
        project,
        values: parsed,
        excludeLobbyingClause: project.lobbying,
      })
    : renderIndividualAgreementHtml({ project, agreement })

  await upsertAgreementPrivate(supabaseAdmin, projectId, {
    ...(parsed
      ? {
          recipient_tax_id: parsed.recipientTaxId,
          foreign_no_tin: parsed.foreignNoTin,
          signatory_email: user.email ?? null,
        }
      : {}),
    rendered_document: documentHtml,
    signed_ip: clientIp(req),
    signed_user_agent: req.headers.get('user-agent'),
    // A self-signed agreement has no outstanding link; clear any earlier one so
    // a previously emailed token can't still be used.
    signing_token_hash: null,
    token_sent_to: null,
    token_sent_at: null,
    token_expires_at: null,
  })

  await maybeActivateProject(supabase, projectId)

  const attestation = parsed
    ? `I, ${parsed.signatoryName}, ${parsed.signatoryTitle} of ${parsed.recipientName}, am authorized to enter into this agreement on its behalf, and agree to the terms of this grant as laid out in the above document.`
    : `I, ${project.profiles.full_name}, agree to the terms of this grant as laid out in the above document.`

  await sendTemplateEmail(
    TEMPLATE_IDS.GENERIC_NOTIF_HTML,
    {
      subject: 'Your Manifund grant agreement',
      htmlContent: agreementEmailHtml({
        greetingName: parsed ? parsed.signatoryName : project.profiles.full_name,
        documentHtml,
        attestation,
      }),
      buttonUrl: `manifund.org/projects/${project.slug}`,
      buttonText: 'View your project',
    },
    user.id
  )
  return NextResponse.json({ success: true })
}
