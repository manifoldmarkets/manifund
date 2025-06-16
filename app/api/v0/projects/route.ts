import { createServerSupabaseClient } from '@/db/supabase-server'
import { listProjectCards } from '@/db/project'
import { NextRequest } from 'next/server'

export const revalidate = 60

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20')
  const sort = searchParams.get('sort') ?? 'newest'

  const supabase = await createServerSupabaseClient()
  const projects = await listProjectCards(supabase, page, pageSize, sort)

  return Response.json(projects)
}
