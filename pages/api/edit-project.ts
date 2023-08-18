import { NextRequest, NextResponse } from 'next/server'
import { updateProjectTopics } from '@/db/topic'
import { createEdgeClient } from './_db'

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
  topicSlugs: string[]
}

export default async function handler(req: NextRequest) {
  const { projectId, title, subtitle, description, topicSlugs } =
    (await req.json()) as EditProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const { error } = await supabase
    .from('projects')
    .update({
      description: description,
      blurb: subtitle,
      title: title,
    })
    .eq('id', projectId)
  if (error) {
    console.error('saveText', error)
  }
  await updateProjectTopics(supabase, topicSlugs, projectId)
  return NextResponse.json('success')
}
