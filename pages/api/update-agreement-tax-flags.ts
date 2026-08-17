import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'
import { upsertAgreementPrivate } from '@/utils/grant-agreement-write'
import { getGrantAgreementPrivate } from '@/db/grant_agreement'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Records which tax documents we hold for a grant. Staff-only: these fields
// live on the RLS-locked private table and are never exposed to grantees.
export default async function handler(req: NextRequest) {
  const { projectId, w9Received, w8Received, determinationLetterOnFile, foreignWithholding } =
    await req.json()
  const { user } = await getUserAndClient(req)
  if (!user || !isAdmin(user)) {
    return new Response('Only admins can update tax flags.', { status: 403 })
  }
  if (typeof projectId !== 'string' || !projectId) {
    return new Response('Missing project.', { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  // Stored as timestamps rather than booleans so we keep when a form arrived.
  // Preserve an existing date when the flag is still checked, so re-saving the
  // panel doesn't quietly restamp it to today; unchecking clears it.
  const existing = await getGrantAgreementPrivate(supabaseAdmin, projectId)

  const now = new Date().toISOString()
  await upsertAgreementPrivate(supabaseAdmin, projectId, {
    w9_received_at: w9Received ? (existing?.w9_received_at ?? now) : null,
    w8_received_at: w8Received ? (existing?.w8_received_at ?? now) : null,
    determination_letter_on_file: !!determinationLetterOnFile,
    foreign_withholding_flag: !!foreignWithholding,
  })

  return NextResponse.json({ success: true })
}
