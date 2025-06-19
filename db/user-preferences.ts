import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export async function getUserPreferences(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  if (!userId) return []
  
  const { data, error } = await supabase
    .rpc('get_user_preferences', { user_uuid: userId })
  
  if (error) {
    console.error('Error fetching user preferences:', error)
    return []
  }
  
  return data || []
}

export async function setUserPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  causeSlugs: string[]
): Promise<void> {
  if (!userId) return
  
  const { error } = await supabase
    .rpc('set_user_preferences', { 
      user_uuid: userId, 
      cause_slugs: causeSlugs 
    })
  
  if (error) {
    console.error('Error setting user preferences:', error)
    throw error
  }
} 