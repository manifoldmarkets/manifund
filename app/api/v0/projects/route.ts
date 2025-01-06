import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { listProjectsPaginated } from '@/db/project'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')
  const causes = searchParams.getAll('cause')

  const supabase = createRouteHandlerClient({ cookies })
  const projects = await listProjectsPaginated(supabase, before, causes)

  return NextResponse.json(projects)
}
