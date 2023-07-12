import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getUser, isAdmin } from '@/db/profile'
import { getUserProjectVote } from '@/db/project'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type VoteProps = {
  projectId: string
  magnitude: number
}

export default async function handler(req: NextRequest) {
  const { projectId, magnitude } = (await req.json()) as VoteProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return NextResponse.error()
  }
  const oldVote = await getUserProjectVote(supabase, projectId, user.id)
  if (oldVote) {
    if (oldVote.magnitude === magnitude) {
      return NextResponse.error()
    }
    await supabase
      .from('project_votes')
      .update({ magnitude })
      .eq('id', oldVote.id)
  } else {
    await supabase
      .from('project_votes')
      .insert([{ project_id: projectId, voter_id: user.id, magnitude }])
  }
  return NextResponse.json('voted!')
}
