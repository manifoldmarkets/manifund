import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Bid = Database['public']['Tables']['bids']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
type BidAndProject = Bid & { projects: Project }

export async function getBidsByUser(supabase: SupabaseClient, user: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, projects(*)')
    .eq('bidder', user)
  if (error) {
    throw error
  }
  return data as BidAndProject[]
}
