import { getAllMiniProfiles } from '@/db/profile'
import { CreateGrantForm } from './create-grant-form'
import { createServerClient } from '@/db/supabase-server'

export default async function CreateGrantPage() {
  const supabase = createServerClient()
  const profiles = (await getAllMiniProfiles(supabase)).filter(
    (profile) => profile.type === 'individual' && profile.full_name.length > 0
  )
  return <CreateGrantForm profiles={profiles} />
}
