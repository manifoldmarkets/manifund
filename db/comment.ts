import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/react'

export type Comment = Database['public']['Tables']['comments']['Row']

export async function getCommentsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('project', project)
  if (error) {
    throw error
  }
  return data as Comment[]
}

export async function sendComment(
  supabase: SupabaseClient,
  content: JSONContent,
  project: string,
  commenter: string
) {
  const { error } = await supabase.from('comments').insert([
    {
      content,
      project,
      commenter,
    },
  ])
  if (error) {
    throw error
  }
}
