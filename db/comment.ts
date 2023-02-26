import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/react'
import { Profile } from './profile'

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentAndProfile = Comment & { profiles: Profile }

export async function getCommentsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(*)')
    .eq('project', project)
  if (error) {
    throw error
  }
  return data as CommentAndProfile[]
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
