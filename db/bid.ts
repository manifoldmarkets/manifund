import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Profile } from './profile'
import { Project } from './project'

export type Bid = Database['public']['Tables']['bids']['Row']
export type BidInsert = Database['public']['Tables']['bids']['Insert']
export type BidAndProject = Bid & { projects: Project }
export type BidAndProfile = Bid & { profiles: Profile }
export type FullBid = Bid & { profiles: Profile } & { projects: Project }

export async function getBidsByUser(supabase: SupabaseClient, userId: string) {
  if (!userId) {
    return []
  }
  const { data, error } = await supabase
    .from('bids')
    .select('*, projects(*)')
    .eq('bidder', userId)
  if (error) {
    throw error
  }
  return data as BidAndProject[]
}

export async function getPendingBidsByUser(
  supabase: SupabaseClient,
  userId: string
) {
  if (!userId) {
    return []
  }
  const { data, error } = await supabase
    .from('bids')
    .select('*, projects(creator, stage, type)')
    .eq('bidder', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
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

export async function getBidById(bidId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, projects(*), profiles(*)')
    .eq('id', bidId)
  if (error) {
    throw error
  }
  return data[0] as FullBid
}

export async function deleteBid(supabase: SupabaseClient, bidId: string) {
  const { error } = await supabase
    .from('bids')
    .update({ status: 'deleted' })
    .eq('id', bidId)
  if (error) {
    console.log(error)
  }
}

export async function getRecentFullBids(
  supabase: SupabaseClient,
  size: number = 10,
  start: number = 0
) {
  const { data } = await supabase
    .from('bids')
    .select('*, profiles(*), projects(*)')
    .order('created_at', { ascending: false })
    .eq('status', 'pending')
    .or('type.eq.donate, type.eq.buy, type.eq."assurance buy"')
    .range(start, start + size)
    .throwOnError()
  return data as FullBid[]
}

export async function insertBid(supabase: SupabaseClient, bid: BidInsert) {
  const { error } = await supabase.from('bids').insert([bid])
  if (error) {
    console.error(error)
  }
}