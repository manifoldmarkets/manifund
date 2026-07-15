import { NextRequest, NextResponse } from 'next/server'
import { invalidateProjectsCache } from '@/db/project-cached'
import { updateProjectCauses } from '@/db/cause'
import { createAdminClient, createEdgeClient } from '@/db/edge'
import { ProjectUpdate, updateProject } from '@/db/project'
import { isAdmin } from '@/db/profile'
import { triggerProjectScoring } from '@/app/utils/trigger-scoring'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const { projectUpdate, projectId, causeSlugs } = (await req.json()) as {
    projectUpdate: ProjectUpdate
    projectId: string
    causeSlugs: string[]
  }
  const supabaseEdge = createEdgeClient(req)
  const resp = await supabaseEdge.auth.getUser()
  const user = resp.data.user
  const supabase = isAdmin(user) ? createAdminClient() : supabaseEdge
  if (!user) return NextResponse.error()
  // Score columns are server-managed; never accept them from the client
  delete projectUpdate.ai_fraction
  delete projectUpdate.quality_score
  await updateProject(supabase, projectId, projectUpdate)
  console.log(causeSlugs)
  await updateProjectCauses(supabase, causeSlugs, projectId)

  invalidateProjectsCache()
  await triggerProjectScoring(projectId)

  return NextResponse.json('success')
}
