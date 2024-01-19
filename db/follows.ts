import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { Profile } from './profile'

export type ProjectFollow =
  Database['public']['Tables']['project_follows']['Row']
export type ProjectFollowAndProfile = ProjectFollow & { profile: Profile }

export async function getProjectFollowerIds(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from('project_follows')
    .select('follower_id')
    .eq('project_id', projectId)
  if (error) {
    throw error
  }
  const followerIds = data.map((follow) => follow.follower_id) as string[]
  return followerIds
}

export async function getFullProjectFollowers(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from('project_follows')
    .select('*, profiles(*)')
    .eq('project_id', projectId)
  if (error) {
    throw error
  }
  return data as ProjectFollowAndProfile[]
}
