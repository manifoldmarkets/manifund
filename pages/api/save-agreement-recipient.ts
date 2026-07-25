import { getProjectAndProfileById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import {
  orgAgreementColumns,
  parseOrgValues,
  upsertAgreementPrivate,
} from '@/utils/grant-agreement-write'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Saves the recipient organization's details without signing anything, so a
// half-filled form survives leaving the page. Refuses once the agreement is
// signed: at that point the details are part of a signed document.
export default async function handler(req: NextRequest) {
  const { projectId, values } = await req.json()
  const { supabase, user } = await getUserAndClient(req)
  const project = await getProjectAndProfileById(supabase, projectId)
  if (!project || user?.id !== project.creator) {
    return Response.error()
  }

  const parsed = parseOrgValues(values)
  if ('error' in parsed) {
    return new Response(parsed.error, { status: 400 })
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

  await upsertAgreementPrivate(supabaseAdmin, projectId, {
    recipient_tax_id: parsed.recipientTaxId,
    foreign_no_tin: parsed.foreignNoTin,
  })

  return NextResponse.json({ success: true })
}
