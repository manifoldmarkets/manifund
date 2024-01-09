import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProjectById } from '@/db/project'
import { JSONContent } from '@tiptap/core'
import { sendComment } from '@/db/comment'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type closeProjectProps = {
  projectId: string
  reportContent: JSONContent
}

export default async function handler(req: NextRequest) {
  const { projectId, reportContent } = (await req.json()) as closeProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  const project = await getProjectById(supabase, projectId)
  if (!user || user.id !== project.creator) return NextResponse.error()
  const { error } = await supabase
    .from('projects')
    .update({
      stage: 'complete',
    })
    .eq('id', projectId)
  if (error) {
    console.error('update stage', error)
    return NextResponse.error()
  }
  await sendComment(
    supabase,
    reportContent,
    project.id,
    user.id,
    undefined,
    'final report'
  )
  return NextResponse.json('success')
}
