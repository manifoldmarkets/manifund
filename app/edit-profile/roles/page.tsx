import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, getProfileRoles } from '@/db/profile'
import { ClaimRoles } from './claim-roles'
import Auth from '@/app/login/auth-ui'

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  if (!user) {
    return <Auth />
  }
  const profileRoles = await getProfileRoles(supabase, user.id)
  return <ClaimRoles profileRoles={profileRoles} />
}
