import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Profile } from './profile'
import { Project } from './project'

export type Bid = Database['public']['Tables']['bids']['Row']
export type BidAndProject = Bid & { projects: Project }
export type BidAndProfile = Bid & { profiles: Profile }

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

export async function getBidsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, profiles(*)')
    .eq('project', project)
  if (error) {
    throw error
  }
  return data.filter((bid) => bid.status === 'pending') as BidAndProfile[]
}

export async function getBidsForResolution(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, profiles(*)')
    .eq('project', project)
    .order('valuation', { ascending: false })
  if (error) {
    throw error
  }
  return data.filter((bid) => bid.status === 'pending') as BidAndProfile[]
}
