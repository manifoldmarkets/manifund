import { VerifyInvestorProps } from '@/app/admin/verify-investor'
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

  const { userId, accredited } = (await req.json()) as VerifyInvestorProps

  const supabaseAdmin = createAdminClient()
  // Create a new txn paying this user
  const { data: txn, error } = await supabaseAdmin
    .from('profiles')
    .update({ accreditation_status: accredited })
    .eq('id', userId)
  if (error) {
    console.log(error)
  }

  return NextResponse.json({ txn, error })
}
