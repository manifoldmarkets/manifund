import { getUser, isAdmin } from '@/db/profile'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from '@/db/edge'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const supabaseEdge = createEdgeClient(req)
  const user = await getUser(supabaseEdge)
  if (!user || !isAdmin(user)) return Response.error()

  const supabaseAdmin = createAdminClient()
  const { data: users, error } = await supabaseAdmin.from('users').select('*')
  if (error) return Response.error()

  return NextResponse.json(users)
}
