import { createServerSupabaseClient } from '@/db/supabase-server'
import { getProjectBySlug } from '@/db/project'
import { supabaseProjectRowUrl } from '@/utils/supabase-admin-url'
import { redirect } from 'next/navigation'

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params
  const supabase = await createServerSupabaseClient()
  const project = await getProjectBySlug(supabase, slug)
  redirect(supabaseProjectRowUrl(project.id))
}
