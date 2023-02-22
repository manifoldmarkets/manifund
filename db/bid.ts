import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Bid = Database['public']['Tables']['bids']['Row']

export async function getBidsByUser(supabase: SupabaseClient, user: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('bidder', user)
  if (error) {
    throw error
  }
  return data as Bid[]
}
