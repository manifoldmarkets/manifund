import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from '@/db/edge'
import { invalidateProjectsCache } from '@/db/project-cached'
import { getProjectById, updateProjectStage } from '@/db/project'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type HideProjectProps = {
  projectId: string
}

export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as HideProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  const project = await getProjectById(supabase, projectId)
  if (!user || user.id !== project.creator) return NextResponse.error()

  await updateProjectStage(supabase, projectId, 'hidden')
  invalidateProjectsCache()

  return NextResponse.json('success')
}
