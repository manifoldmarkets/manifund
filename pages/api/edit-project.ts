import { NextRequest, NextResponse } from 'next/server'
import { updateProjectCauses } from '@/db/cause'
import { createAdminClient, createEdgeClient } from './_db'
import { updateProject } from '@/db/project'
import { isAdmin } from '@/db/txn'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type EditProjectProps = {
  projectId: string
  title: string
  subtitle: string
  description: string
  fundingGoal: number
  causeSlugs: string[]
}

export default async function handler(req: NextRequest) {
  const projectChanges = (await req.json()) as EditProjectProps
  const supabaseEdge = createEdgeClient(req)
  const resp = await supabaseEdge.auth.getUser()
  const user = resp.data.user
  const supabase = isAdmin(user) ? createAdminClient() : supabaseEdge
  if (!user) return NextResponse.error()
  const { projectId, causeSlugs } = projectChanges
  await updateProject(supabase, projectId, projectChanges)
  await updateProjectCauses(supabase, causeSlugs, projectId)
  return NextResponse.json('success')
}
