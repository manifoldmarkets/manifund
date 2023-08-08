import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type Topic = Database['public']['Tables']['topics']['Row']
export type ProjectTopicLink =
  Database['public']['Tables']['project_topics']['Row']

export async function getTopics(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('topics').select('*')
  if (error) {
    throw error
  }
  return data as Topic[]
}
