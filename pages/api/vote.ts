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
  newMagnitude: number
}

export default async function handler(req: NextRequest) {
  const { projectId, newMagnitude } = (await req.json()) as VoteProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return NextResponse.error()
  }
  console.log('newMagnitude', newMagnitude)
  const oldVote = await getUserProjectVote(supabase, projectId, user.id)
  console.log('oldVote', oldVote)
  if (oldVote) {
    await supabase
      .from('project_votes')
      .update({ magnitude: newMagnitude })
      .eq('id', oldVote.id)
  } else {
    await supabase
      .from('project_votes')
      .insert([
        { project_id: projectId, voter_id: user.id, magnitude: newMagnitude },
      ])
  }
  return NextResponse.json('voted!')
}
