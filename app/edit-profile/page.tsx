import { createClient, getUser } from '@/db/supabase-server'
import { EditProfileForm } from './edit-profile'
import getProfileById from '@/db/profile'

export default async function Page() {
  const supabase = createClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>you are not logged in</div>
  }
  const profile = await getProfileById(supabase, user?.id)

  return <EditProfileForm profile={profile} />
}
