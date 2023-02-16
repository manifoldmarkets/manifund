import { Database } from '@/utils/database.types'
import { createClient, getUser } from '@/utils/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'
import { EditProfileForm } from './edit-profile'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default async function Page() {
  const supabase = createClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>you are not logged in</div>
  }
  const profile = await getProfile(supabase, user?.id)

  return (
    <div>
      <div className="text-blue-400">This is a server component</div>

      <div className="text-blue-400">
        {JSON.stringify(profile, null, 2)}
        <EditProfileForm profile={profile} />
      </div>
    </div>
  )
}

async function getProfile(
  supabase: SupabaseClient,
  id: string
): Promise<{ id: string; username: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] ? data[0] : { id, username: null }
}
