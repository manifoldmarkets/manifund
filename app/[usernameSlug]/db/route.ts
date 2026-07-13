import { createServerSupabaseClient } from '@/db/supabase-server'
import { getProfileByUsername } from '@/db/profile'
import { supabaseProfileRowUrl } from '@/utils/supabase-admin-url'
import { notFound, redirect } from 'next/navigation'

export async function GET(_request: Request, props: { params: Promise<{ usernameSlug: string }> }) {
  const { usernameSlug } = await props.params
  const supabase = await createServerSupabaseClient()
  const profile = await getProfileByUsername(supabase, usernameSlug)
  if (!profile) {
    notFound()
  }
  redirect(supabaseProfileRowUrl(profile.id))
}
