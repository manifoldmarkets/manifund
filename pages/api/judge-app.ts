import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getProjectById, updateProjectStage } from '@/db/project'
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

type judgeAppProps = {
  projectId: string
  causeSlug: string
  decision: 'approve' | 'reject'
  funding: number
}

export default async function handler(req: NextRequest) {
  const { projectId, causeSlug, decision, funding } =
    (await req.json()) as judgeAppProps
  console.log('judgeAppProps', projectId, causeSlug, decision, funding)
  const supabase = createEdgeClient(req)

  // Turn off auth checks for hackathon
  // const resp = await supabase.auth.getUser()
  // const user = resp.data.user
  // const project = await getProjectById(supabase, projectId)
  // if (!user || user.id !== project.creator) return NextResponse.error()

  // Update the project cause to include the decision and funding amount
  const { data, error } = await supabase
    .from('project_causes')
    .update({
      application_stage: decision === 'approve' ? 'active' : 'not funded',
    })
    .eq('project_id', projectId)
    .eq('cause_slug', causeSlug)
  console.log('done', data, error)

  return NextResponse.json('success')
}
