import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { sortBy } from 'lodash'

export type Topic = Database['public']['Tables']['topics']['Row']
export type FullTopic = Topic & { projects: { stage: string }[] }
export type MiniTopic = { title: string; slug: string }
export type ProjectTopicLink =
  Database['public']['Tables']['project_topics']['Row']

export async function listFullTopics(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('topics')
    .select('*, projects(stage)')
  if (error) {
    throw error
  }
  return sortBy(data, [
    function (topic) {
      return topic.data.sort
    },
  ]) as FullTopic[]
}

export async function listMiniTopics(supabase: SupabaseClient) {
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

export async function getTopic(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Topic
}
