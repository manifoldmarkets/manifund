import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type SetAlertsPausedProps = {
  projectId: string
  alertsPaused: boolean
}

export default async function handler(req: NextRequest) {
  const { projectId, alertsPaused } = (await req.json()) as SetAlertsPausedProps
  const { user } = await getUserAndClient(req)
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Only admins can pause project alerts.' }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ alerts_paused: alertsPaused })
    .eq('id', projectId)
  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: `Failed to update project alerts: ${error.message}` },
      { status: 500 }
    )
  }
  return NextResponse.json('success')
}
