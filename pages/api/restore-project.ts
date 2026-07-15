import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'
import { add, format } from 'date-fns'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type RestoreProjectProps = {
  projectId: string
}

// Restores a project that elapsed without hitting its minimum funding bar (the
// inverse of the `reject_proposal` RPC): extends its funding deadline to 30 days
// from today, puts it back into the 'proposal' stage, and un-declines its bids.
export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as RestoreProjectProps
  const { supabase, user } = await getUserAndClient(req)
  const adminSupabase = createAdminClient()

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const newCloseDate = format(add(new Date(), { days: 30 }), 'yyyy-MM-dd')

  const { error: projectError } = await adminSupabase
    .from('projects')
    .update({ stage: 'proposal', auction_close: newCloseDate })
    .eq('id', projectId)
  if (projectError) {
    console.error('Error restoring project:', projectError)
    return NextResponse.json({ error: 'Failed to restore project' }, { status: 500 })
  }

  // Restore the bids that were declined when the project elapsed.
  const { error: bidsError } = await adminSupabase
    .from('bids')
    .update({ status: 'pending' })
    .match({ project: projectId, status: 'declined' })
  if (bidsError) {
    console.error('Error restoring bids:', bidsError)
    return NextResponse.json({ error: 'Failed to restore bids' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
