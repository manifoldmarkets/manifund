import { Database } from './database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Bid } from './bid'
import { Txn } from './txn'
import { Profile } from './profile'
import { Comment } from '@/db/comment'
import { Round } from './round'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectTransfer =
  Database['public']['Tables']['project_transfers']['Row']
export type ProjectVote = Database['public']['Tables']['project_votes']['Row']

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
    .select('*, bids(*), txns(*), comments(*), rounds(*), project_transfers(*)')
    .eq('creator', user)
  if (error) {
    throw error
  }
  return data as FullProject[]
}

export type FullProject = Project & { profiles: Profile } & {
  bids: Bid[]
} & { txns: Txn[] } & { comments: Comment[] } & { rounds: Round } & {
  project_transfers: ProjectTransfer[]
} & { project_votes: ProjectVote[] }

export async function listProjects(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('projects')
    .select(
      'title, id, created_at, creator, slug, blurb, stage, funding_goal, min_funding, type, approved, signed_agreement, profiles(*), bids(*), txns(*), comments(id), rounds(title, slug), project_transfers(*), project_votes(magnitude)'
    )
    .order('created_at', { ascending: false })
    .throwOnError()
  // Scary type conversion!
  return data as unknown as FullProject[]
}

export async function getFullProjectBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data } = await supabase
    .from('projects')
    .select(
      '*, profiles(*), bids(*), txns(*), comments(*), rounds(*), project_transfers(*), project_votes(*)'
    )
    .eq('slug', slug)
    .throwOnError()
  if (data === null) {
    return null
  }
  return data[0] as FullProject
}

export type ProjectAndProfile = Project & { profiles: Profile }
export async function getProjectAndProfileBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data } = await supabase
    .from('projects')
    .select('*, profiles(*)')
    .eq('slug', slug)
    .throwOnError()
  if (data === null) {
    return null
  }
  return data[0] as ProjectAndProfile
}
// This does not include project or round descriptions, for a smaller payload
export async function getFullProjectsByRound(
  supabase: SupabaseClient,
  roundTitle: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      'title, id, created_at, creator, slug, blurb, stage, funding_goal, min_funding, type, profiles(*), bids(*), txns(*), comments(*), rounds(title, slug), project_transfers(*), project_votes(magnitude)'
    )
    .eq('round', roundTitle)
  if (error) {
    throw error
  }
  // Scary type conversion!
  return data as unknown as FullProject[]
}

export async function getProjectsPendingTransferByUser(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from('projects')
    .select('*, project_transfers(*)')
    .eq('creator', userId)
  return (data as FullProject[])?.filter((project) => {
    const numTransfers = project.project_transfers
      ? project.project_transfers.filter((transfer) => !transfer.transferred)
          .length
      : 0
    return numTransfers > 0
  }) as Project[]
}

export type ProjectAndBids = Project & { bids: Bid[] }
export async function getProjectAndBidsById(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data } = await supabase
    .from('projects')
    .select('*, bids(*)')
    .eq('id', projectId)
    .throwOnError()
  if (data === null) {
    return null
  }
  return data[0] as ProjectAndBids
}

export async function getUserProjectVote(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
) {
  const { data } = await supabase
    .from('project_votes')
    .select('*')
    .eq('project_id', projectId)
    .throwOnError()
  return data?.find((vote) => vote.voter_id === userId) as ProjectVote | null
}
