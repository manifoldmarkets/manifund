import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getIncomingTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  console.log('user', user)
  const { data, error } = await supabase
    .from('txns')
    .select()
    .eq('to_id', user)
    .neq('token', 'USD')
  if (error) {
    throw error
  }
  return data
}
