import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById } from '@/db/profile'
import { EditProfileForm } from './edit-profile'

export const revalidate = 0
export default async function Page() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>You are not logged in.</div>
  }
  const profile = await getProfileById(supabase, user?.id)
  if (!profile) {
    return <div>No profile found.</div>
  }
  return <EditProfileForm profile={profile} />
}
