import { isAdmin } from '@/db/profile'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const { supabase: supabaseEdge, user } = await getUserAndClient(req)
  if (!user || !isAdmin(user)) return Response.error()

  const supabaseAdmin = createAdminClient()
  const { data: users, error } = await supabaseAdmin.from('users').select('*')
  if (error) return Response.error()

  return NextResponse.json(users)
}
