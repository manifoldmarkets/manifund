import { Bid } from '@/db/bid'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { getProfileByUsername, isAdmin } from '@/db/profile'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

const LEO_USERNAME = 'LeoGao'
const LEO_GRANT_CAUSE = 'leo-microgrants'
const LEO_GRANT_AMOUNT = 10_000

// Admin-only: places a $10k offer to donate from Leo on a project in his
// microgranting program (the "Leo $10k" button on the project page).
export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as { projectId: string }
  if (!projectId) {
    return new Response('Missing projectId', { status: 400 })
  }
  const { supabase, user } = await getUserAndClient(req)
  if (!isAdmin(user)) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Guard: only valid for projects in Leo's microgranting program
  const { data: causeRow } = await supabase
    .from('project_causes')
    .select('project_id')
    .eq('project_id', projectId)
    .eq('cause_slug', LEO_GRANT_CAUSE)
    .maybeSingle()
  if (!causeRow) {
    return new Response("Project is not in Leo's microgranting program", { status: 400 })
  }
  const leo = await getProfileByUsername(supabase, LEO_USERNAME)
  if (!leo) {
    return new Response('Leo profile not found', { status: 404 })
  }
  // Insert the bid as Leo via the service-role client, which bypasses the
  // `bidder = auth.uid()` RLS policy (the admin is acting on Leo's behalf).
  const supabaseAdmin = createAdminClient()
  const newBid = {
    id: uuid(),
    project: projectId,
    bidder: leo.id,
    valuation: 0,
    amount: LEO_GRANT_AMOUNT,
    status: 'pending' as Bid['status'],
    type: 'donate' as Bid['type'],
  }
  await supabaseAdmin.from('bids').insert([newBid]).throwOnError()
  return NextResponse.json(newBid)
}
