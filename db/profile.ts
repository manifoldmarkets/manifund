import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export default async function getProfileById(
  supabase: SupabaseClient,
  id: string = ''
): Promise<{ id: string; username: string | null }> {
  if (!id) {
    return { id, username: null }
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] ? data[0] : { id, username: null }
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string = ''
) {
  if (!username) {
    return { id: null, username }
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
  if (error) {
    throw error
  }
  return data[0] ? data[0] : { id: null, username }
}
