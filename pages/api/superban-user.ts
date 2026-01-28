import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { isAdmin } from '@/db/profile'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type SuperbanUserProps = {
  userId: string
}

export default async function handler(req: NextRequest) {
  const { userId } = (await req.json()) as SuperbanUserProps
  const supabase = createEdgeClient(req)
  const adminSupabase = createAdminClient()
  
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete all projects by this user (cascades to txns, bids, comments on projects, etc.)
  const { error: projectsError } = await adminSupabase
    .from('projects')
    .delete()
    .eq('creator', userId)
  if (projectsError) {
    console.error('Error deleting projects:', projectsError)
    return NextResponse.json({ error: 'Failed to delete projects' }, { status: 500 })
  }

  // Delete all comments by this user (cascades to comment_rxns)
  const { error: commentsError } = await adminSupabase
    .from('comments')
    .delete()
    .eq('commenter', userId)
  if (commentsError) {
    console.error('Error deleting comments:', commentsError)
    return NextResponse.json({ error: 'Failed to delete comments' }, { status: 500 })
  }

  // Delete the user profile (cascades to bids, votes, evals, follows, reactions, etc.)
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (profileError) {
    console.error('Error deleting profile:', profileError)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }

  // Delete the auth user
  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
  if (authError) {
    console.error('Error deleting auth user:', authError)
    return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
