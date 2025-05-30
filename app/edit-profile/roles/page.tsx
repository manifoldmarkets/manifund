import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, getProfileRoles } from '@/db/profile'
import { ClaimRoles } from './claim-roles'
import AuthModal from '@/components/auth/AuthModal'

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  if (!user) {
    return <AuthModal isOpen={true} />
  }
  const profileRoles = await getProfileRoles(supabase, user.id)
  return <ClaimRoles profileRoles={profileRoles} />
}
