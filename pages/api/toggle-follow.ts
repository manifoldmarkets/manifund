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
  console.log('in handler')
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  console.log('2')
  if (!user) return NextResponse.error()
  console.log('3')
  const { error } = await supabase.rpc('toggle_follow', {
    project_id: projectId,
    follower_id: user.id,
  })
  console.log('4')
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  console.log('5')
  return NextResponse.json('success')
}
