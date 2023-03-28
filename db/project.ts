import { Database } from './database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Bid } from './bid'
import { Txn } from './txn'
import { Profile } from './profile'
import { Comment } from '@/db/comment'
import { Round } from './round'
import { getObjectSize } from '@/utils/debug'

export type Project = Database['public']['Tables']['projects']['Row']

export const TOTAL_SHARES = 10_000_000

export async function getProjectBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Project
}

export async function getProjectById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] as Project
}

export async function getProjectsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, bids(*), txns(*), comments(*), rounds(*)')
    .eq('creator', user)
  if (error) {
    throw error
  }
  return data as FullProject[]
}

export type FullProject = Project & { profiles: Profile } & {
  bids: Bid[]
} & { txns: Txn[] } & { comments: Comment[] } & { rounds: Round }

export async function listProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles(*), bids(*), txns(*), comments(*), rounds(*)')
    .order('created_at', { ascending: false })
  if (error) {
    throw error
  }
  return data as FullProject[]
}

export async function getFullProjectBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles(*), bids(*), txns(*), comments(*), rounds(*)')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as FullProject
}

// Note: This does not include project or round descriptions, for a smaller payload
export async function getFullProjectsByRound(
  supabase: SupabaseClient,
  roundTitle: string
) {
  const { data, error } = await supabase
    .from('projects')
    // .select(
    //   'title, id, creator, slug, blurb, stage, profiles(*), bids(*), txns(*), comments(*), rounds(title, slug)'
    // )
    .select('*, profiles(*), bids(*), txns(*), comments(*), rounds(*)')
    .eq('round', roundTitle)
  console.log('getFullProjectsByRound', getObjectSize(data))
  if (error) {
    throw error
  }
  return data as FullProject[]
}
