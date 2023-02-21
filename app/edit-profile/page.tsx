import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById } from '@/db/profile'
import { EditProfileForm } from './edit-profile'

export default async function Page() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>you are not logged in</div>
  }
  const profile = await getProfileById(supabase, user?.id)

  return <EditProfileForm profile={profile} />
}
