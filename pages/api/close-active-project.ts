import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProjectBySlug } from '@/db/project'
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
  projectSlug: string
  reportContent: JSONContent
}

export default async function handler(req: NextRequest) {
  const { projectSlug, reportContent } = (await req.json()) as closeProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  const project = await getProjectBySlug(supabase, projectSlug)
  if (!user || user.id !== project.creator) return NextResponse.error()
  const { error } = await supabase
    .from('projects')
    .update({
      stage: 'complete',
    })
    .eq('slug', projectSlug)
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
