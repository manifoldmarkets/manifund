import { NextRequest, NextResponse } from 'next/server'
import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  // For now, always return an error
  return NextResponse.json({ error: 'Funds paused' }, { status: 400 })

  const roles = await req.json()
  const supabase = createEdgeClient(req)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.error()

  // Check if profile_roles already exists
  const { data: existingRole } = await supabase
    .from('profile_roles')
    .select()
    .eq('id', user?.id ?? '')
    .single()
  if (existingRole)
    return NextResponse.json(
      { error: "You've already claimed your roles" },
      { status: 400 }
    )

  // Create profile_roles
  const newRoles = {
    id: user?.id ?? '',
    donor: !!roles.donor,
    organizer: roles.organizer || null,
    scholar: roles.scholar || null,
    volunteer: roles.volunteer || null,
    worker: roles.worker || null,
    senior: roles.senior || null,
    insider: !!roles.insider,
  }
  await supabase.from('profile_roles').insert(newRoles).throwOnError()

  // Grant funds
  const totalAmount = (Object.values(roles).filter(Boolean).length + 1) * 100

  const supabaseAdmin = await createAuthorizedAdminClient()
  await supabaseAdmin.from('txns').insert({
    from_id: process.env.NEXT_PUBLIC_PROD_BANK_ID,
    to_id: user?.id ?? '',
    amount: totalAmount,
    token: 'USD',
    type: 'deposit',
  })

  return NextResponse.json({ success: true, amount: totalAmount })
}
