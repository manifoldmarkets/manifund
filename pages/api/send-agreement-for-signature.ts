import { getProjectAndProfileById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { escapeHtml, sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { getURL } from '@/utils/constants'
import {
  orgAgreementColumns,
  parseOrgValues,
  upsertAgreementPrivate,
} from '@/utils/grant-agreement-write'
import { generateSigningToken, hashSigningToken, signingTokenExpiry } from '@/utils/signing-token'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Emails a signing link to a third party who must sign on the recipient
// organization's behalf -- typically a fiscal sponsor's authorized officer, who
// usually has no Manifund account. The link is the credential; only its sha256
// is stored.
export default async function handler(req: NextRequest) {
  const { projectId, values, signatoryEmail } = await req.json()
  const { supabase, user } = await getUserAndClient(req)
  const project = await getProjectAndProfileById(supabase, projectId)
  if (!project || user?.id !== project.creator) {
    return Response.error()
  }

  const parsed = parseOrgValues(values)
  if ('error' in parsed) {
    return new Response(parsed.error, { status: 400 })
  }
  const email = typeof signatoryEmail === 'string' ? signatoryEmail.trim() : ''
  if (!email || !email.includes('@')) {
    return new Response('Enter a valid email address for the signatory.', { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  const { data: existing } = await supabaseAdmin
    .from('grant_agreements')
    .select('signed_at')
    .eq('project_id', projectId)
    .maybeSingle()
    .throwOnError()
  if (existing?.signed_at) {
    return new Response('This agreement has already been signed.', { status: 409 })
  }

  await supabaseAdmin
    .from('grant_agreements')
    .upsert(
      {
        project_id: projectId,
        project_title: project.title,
        project_description: project.description,
        lobbying_clause_excluded: project.lobbying,
        ...orgAgreementColumns(parsed),
      },
      { onConflict: 'project_id' }
    )
    .throwOnError()

  // Minting a new token invalidates any previous one, so "resend" and "send to
  // a different person" are the same operation and an old link stops working.
  const token = generateSigningToken()
  await upsertAgreementPrivate(supabaseAdmin, projectId, {
    recipient_tax_id: parsed.recipientTaxId,
    foreign_no_tin: parsed.foreignNoTin,
    signatory_email: email,
    signing_token_hash: await hashSigningToken(token),
    token_sent_to: email,
    token_sent_at: new Date().toISOString(),
    token_expires_at: signingTokenExpiry(),
  })

  await sendTemplateEmail(
    TEMPLATE_IDS.GENERIC_NOTIF_HTML,
    {
      subject: `Signature requested: Manifund grant agreement for "${project.title}"`,
      htmlContent: `<p>Hello ${escapeHtml(parsed.signatoryName)},</p>
      <p>${escapeHtml(project.profiles.full_name)} has proposed a project,
      &quot;${escapeHtml(project.title)}&quot;, to be funded by Manifold for Charity, with
      <strong>${escapeHtml(parsed.recipientName)}</strong> named as the recipient of the grant.</p>
      <p>You've been listed as the person authorized to sign on
      ${escapeHtml(parsed.recipientName)}'s behalf. Use the link below to review the agreement,
      correct any details, and sign. The link expires in 30 days.</p>`,
      buttonUrl: `${getURL()}/agreement/sign/${token}`,
      buttonText: 'Review and sign',
    },
    undefined,
    email
  )

  return NextResponse.json({ success: true })
}
