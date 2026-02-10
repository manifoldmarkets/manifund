import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from '@/db/edge'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as { projectId: string }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const { error } = await supabase.rpc('toggle_follow', {
    project_id: projectId,
    follower_id: user.id,
  })
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  return NextResponse.json('success')
}
