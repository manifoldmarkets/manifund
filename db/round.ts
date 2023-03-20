import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type Round = Database['public']['Tables']['rounds']['Row']

export async function getRounds(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .order('auction_close_date', { ascending: true })
  if (error) {
    throw error
  }
  return data as Round[]
}
