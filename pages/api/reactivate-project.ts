import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getUser } from '@/db/profile'
import { getProjectWithCausesById } from '@/db/project'
import { getPrizeCause } from '@/db/cause'
import { checkReactivateEligible } from '@/utils/activate-project'
import { SupabaseClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as { projectId: string }
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  const project = await getProjectWithCausesById(supabase, projectId)
  if (!project || !user || user.id !== project.creator) {
    console.error('no project or user')
    return Response.error()
  }
  const prizeCause = await getPrizeCause(
    project.causes.map((c) => c.slug),
    supabase
  )
  if (!checkReactivateEligible(project, prizeCause)) {
    console.error('not eligible')
    return Response.error()
  }
  await reactivateProject(supabase, projectId)
  return NextResponse.json('success')
}

async function reactivateProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase
    .from('projects')
    .update({ stage: 'active', amm_shares: 0 })
    .eq('id', projectId)
  if (error) {
    console.error(error)
  }
}
