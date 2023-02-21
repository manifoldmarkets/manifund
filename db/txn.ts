import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getIncomingSharesByUser(
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

export async function getOutgoingSharesByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select()
    .eq('from_id', user)
    .neq('token', 'USD')
  if (error) {
    throw error
  }
  return data
}

export async function getIncomingPaymentsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select()
    .eq('to_id', user)
    .eq('token', 'USD')
  if (error) {
    throw error
  }
  return data
}

export async function getOutgoingPaymentsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select()
    .eq('from_id', user)
    .eq('token', 'USD')
  if (error) {
    throw error
  }
  return data
}
