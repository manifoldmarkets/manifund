import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { JSONContent } from '@tiptap/react'
import { sendComment } from '@/db/comment'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type CommentProps = {
  content: JSONContent
  projectId: string
  replyingTo?: string
}

export default async function handler(req: NextRequest) {
  const { content, projectId, replyingTo } = (await req.json()) as CommentProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  await sendComment(supabase, content, projectId, user.id, replyingTo)
  const { error } = await supabase.rpc('follow_project', {
    project_id: projectId,
    follower_id: user.id,
  })
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  return NextResponse.json('success')
}
