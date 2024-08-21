import { createClient } from '@/db/supabase-browser'
import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById, getProfileRoles } from '@/db/profile'
import { ClaimRoles } from './claim-roles'

export const revalidate = 60
export default async function Page() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>You are not logged in.</div>
  }
  const profileRoles = await getProfileRoles(supabase, user.id)
  return <ClaimRoles profileRoles={profileRoles} />
}
