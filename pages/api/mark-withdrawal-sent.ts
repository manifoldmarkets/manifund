import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'
import { MarkWithdrawalSentProps } from '@/app/admin/withdrawals/mark-sent-button'
import { WithdrawalRequest } from '@/db/withdrawal-request'
import { markSent } from '@/utils/mercury-withdrawals'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Closes out a withdrawal an admin wired by hand from the Mercury dashboard
// (India and the Philippines). The txns row already exists -- it was written
// when the grantee made the request -- so this only stamps sent_at and sends
// the confirmation email.
export default async function handler(req: NextRequest) {
  const { requestId } = (await req.json()) as MarkWithdrawalSentProps
  const { user } = await getUserAndClient(req)
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient()
  const { data } = await supabaseAdmin
    .from('withdrawal_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()
  const request = data as WithdrawalRequest | null
  if (!request) {
    return NextResponse.json({ error: 'No such withdrawal request.' }, { status: 404 })
  }
  if (request.status !== 'needs_manual') {
    return NextResponse.json(
      { error: `Only manual withdrawals can be marked sent (this one is ${request.status}).` },
      { status: 409 }
    )
  }

  await markSent(supabaseAdmin, request, new Date().toISOString())
  return NextResponse.json({ status: 'sent' })
}
