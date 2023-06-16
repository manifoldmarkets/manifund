import { getProjectById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { maybeActivateGrant } from '@/utils/activate-grant'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/lodash.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
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
  await maybeActivateGrant(supabase, projectId)
  return NextResponse.json({ success: true })
}
