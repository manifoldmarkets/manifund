import { NextRequest, NextResponse } from 'next/server'
import { updateProjectCauses } from '@/db/cause'
import { createAdminClient, createEdgeClient } from './_db'
import { ProjectUpdate, updateProject } from '@/db/project'
import { isAdmin } from '@/db/txn'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  console.log(0)
  const { projectUpdate, projectId, causeSlugs } = (await req.json()) as {
    projectUpdate: ProjectUpdate
    projectId: string
    causeSlugs: string[]
  }
  console.log(1)
  const supabaseEdge = createEdgeClient(req)
  const resp = await supabaseEdge.auth.getUser()
  const user = resp.data.user
  const supabase = isAdmin(user) ? createAdminClient() : supabaseEdge
  console.log(2)
  if (!user) return NextResponse.error()
  console.log(3)
  await updateProject(supabase, projectId, projectUpdate)
  console.log(4)
  await updateProjectCauses(supabase, causeSlugs, projectId)
  console.log(5)
  return NextResponse.json('success')
}
