import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export type ProjectFollow = Database['public']['Tables']['project_follows']['Row']

export async function getProjectFollowerIds(supabase: SupabaseClient, projectId: string) {
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
