import { Database } from '@/utils/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { GetProfile } from './get-profile'

export type Profile = Database['public']['Tables']['profiles']['Row']

export default function Page() {
  {
    return (
      <div>
        <div className="text-blue-400">This is a server component</div>
        {/* @ts-expect-error Server Component */}
        <GetProfile />
      </div>
    )
  }
}

export async function getProfile(
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
