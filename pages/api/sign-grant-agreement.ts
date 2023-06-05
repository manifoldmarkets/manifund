import { getProjectById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { checkGrantFundingReady } from '@/utils/checks'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const { projectId } = await req.json()
  const supabase = createEdgeClient(req)
  const project = await getProjectById(supabase, projectId)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (user?.id !== project.creator) {
    return Response.error()
  }
  await supabase
    .from('projects')
    .update({ signed_agreement: true })
    .eq('id', projectId)
    .throwOnError()
  if (await checkGrantFundingReady(supabase, projectId)) {
    console.log('Activating grant')
    await fetch('/api/activate-grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: projectId }),
    })
  }
  return NextResponse.json({ success: true })
}
