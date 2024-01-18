import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  const { projectId } = (await req.json()) as { projectId: string }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const { data: currentFollow } = await supabase
    .from('project_follows')
    .select()
    .eq('project_id', projectId)
    .eq('follower_id', user.id)

  return NextResponse.json(projectId)
}
