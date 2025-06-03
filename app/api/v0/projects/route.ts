import { createServerSupabaseClient } from '@/db/supabase-server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { toMarkdown } from '@/utils/tiptap-parsing'

async function listProjectsPaginated(
  supabase: SupabaseClient,
  before?: string | null
) {
  let query = supabase
    .from('projects')
    .select(
      `
      title, 
      id, 
      created_at, 
      creator,
      slug,
      blurb,
      description,
      stage,
      funding_goal,
      min_funding,
      type,
      profiles!projects_creator_fkey(username, full_name),
      txns(amount, token),
      bids(amount, status),
      causes(title, slug)
    `
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .limit(100)

  if (before) {
    const timestamp = new Date(before).toISOString()
    query = query.filter('created_at', 'lt', timestamp)
  }

  const { data } = await query.throwOnError()
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')

  const supabase = await createServerSupabaseClient()
  const projects = await listProjectsPaginated(supabase, before)

  projects?.map((project) => {
    // Convert Tiptap description to markdown
    project.description = toMarkdown(project.description)

    // Remove txns that are not token = USD
    project.txns = project.txns.filter((txn) => txn.token === 'USD')

    // Remove bids that are not pending
    project.bids = project.bids.filter((bid) => bid.status === 'pending')

    // Convert created_at to ISO string
    project.created_at = new Date(project.created_at).toISOString()
  })

  return NextResponse.json(projects)
}
