import { createClient } from '@/utils/supabase-server'
import { EditProfileForm } from './edit-profile'
import { getProfile } from './page'

export async function GetProfile() {
  const supabase = createClient()
  const session = await supabase.auth.getSession()
  const userId = session.data.session?.user.id
  if (!userId) {
    return <div>you are not logged in</div>
  }

  const profile = await getProfile(supabase, userId)
  return (
    <div className="text-blue-400">
      {JSON.stringify(profile, null, 2)}
      <EditProfileForm profile={profile} />
    </div>
  )
}
