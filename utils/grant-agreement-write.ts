import { SupabaseClient } from '@supabase/supabase-js'
import { maybeActivateProject } from '@/utils/activate-project'
import { type ProjectAndProfile } from '@/db/project'

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

// The full write sequence for an executed signature, shared by the self-sign
// and external-sign endpoints so their ordering can't drift. Emails stay with
// the callers: they differ per route and must never fail the signature.
export async function commitSignature(props: {
  supabaseAdmin: SupabaseClient
  // Used for the activation check; the self-sign route passes the caller's
  // cookie-authed client, the external route the admin client.
  activationClient: SupabaseClient
  project: ProjectAndProfile
  signedAt: string
  documentHtml: string
  // Columns specific to the agreement kind (individual vs organization).
  agreementColumns: Record<string, unknown>
  privatePatch: Record<string, unknown>
}) {
  const { supabaseAdmin, activationClient, project, signedAt, documentHtml } = props

  await supabaseAdmin
    .from('grant_agreements')
    .upsert(
      {
        project_id: project.id,
        signed_at: signedAt,
        rendered_document: documentHtml,
        project_title: project.title,
        project_description: project.description,
        lobbying_clause_excluded: project.lobbying,
        ...props.agreementColumns,
      },
      { onConflict: 'project_id' }
    )
    .throwOnError()

  // Only after the agreement row exists: if the upsert above fails, the project
  // must not be left marked as signed with no agreement to show for it.
  await supabaseAdmin
    .from('projects')
    .update({ signed_agreement: true })
    .eq('id', project.id)
    .throwOnError()

  await upsertAgreementPrivate(supabaseAdmin, project.id, props.privatePatch)

  await maybeActivateProject(activationClient, project.id)
}
