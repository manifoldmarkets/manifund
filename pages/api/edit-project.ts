import { NextRequest, NextResponse } from 'next/server'
import { invalidateProjectsCache } from '@/db/project-cached'
import { updateProjectCauses } from '@/db/cause'
import { createAdminClient, createEdgeClient } from './_db'
import { ProjectUpdate, updateProject } from '@/db/project'
import { isAdmin } from '@/db/txn'
import { updateProjectEmbedding } from '@/app/utils/embeddings'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
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
  await updateProject(supabase, projectId, projectUpdate)
  console.log(causeSlugs)
  await updateProjectCauses(supabase, causeSlugs, projectId)

  invalidateProjectsCache()
  updateProjectEmbedding(projectId).catch((error) => {
    console.error('Failed to regenerate embeddings for updated project:', error)
  })

  return NextResponse.json('success')
}
