import Auth from '@/app/login/auth-ui'
import { getUser, getProfileById } from '@/db/profile'
import { createServerSupabaseClient } from '@/db/supabase-server'

export default async function Login() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  const profile = user ? await getProfileById(supabase, user?.id) : null
  return <Auth profileComplete={!!profile} />
}
