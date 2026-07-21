import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserAndClient } from '@/db/edge'
import { isAdmin } from '@/db/profile'
import { superbanUser } from '@/db/superban'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type SuperbanUserProps = {
  userId: string
}

export default async function handler(req: NextRequest) {
  const { userId } = (await req.json()) as SuperbanUserProps
  const { user } = await getUserAndClient(req)

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await superbanUser(createAdminClient(), userId)
  } catch (error) {
    console.error('Error superbanning user:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
