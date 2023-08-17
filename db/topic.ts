import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type Topic = Database['public']['Tables']['topics']['Row']
export type MiniTopic = { title: string; slug: string }
export type ProjectTopicLink =
  Database['public']['Tables']['project_topics']['Row']

export async function getTopics(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('topics').select('*')
  if (error) {
    throw error
  }
  return data as Topic[]
}

export async function getMiniTopics(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('topics').select('title, slug')
  if (error) {
    throw error
  }
  return data as MiniTopic[]
}

export async function updateProjectTopics(
  supabase: SupabaseClient,
  topicSlugs: string[],
  projectId: string
) {
  await supabase
    .from('project_topics')
    .delete()
    .eq('project_id', projectId)
    .throwOnError()
  await supabase
    .from('project_topics')
    .insert(
      topicSlugs.map((slug) => ({ project_id: projectId, topic_slug: slug }))
    )
    .throwOnError()
}
