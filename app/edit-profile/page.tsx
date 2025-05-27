import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, getProfileById } from '@/db/profile'
import { EditProfileForm } from './edit-profile'
import Auth from '@/app/login/auth-ui'

export const revalidate = 60
export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  if (!user) {
    return <Auth />
  }
  const profile = await getProfileById(supabase, user?.id)
  if (!profile) {
    return <div>No profile found.</div>
  }
  return <EditProfileForm profile={profile} />
}
