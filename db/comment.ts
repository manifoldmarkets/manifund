import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/react'
import { Project } from './project'
import { Profile } from './profile'
import uuid from 'react-uuid'

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentAndProfile = Comment & { profiles: Profile }
export type FullComment = Comment & { profiles: Profile } & {
  projects: Project
}

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
  projectId: string,
  commenterId: string,
  replyingTo?: string
) {
  const commentId = uuid()
  const { error } = await supabase.from('comments').insert([
    {
      id: commentId,
      content,
      project: projectId,
      commenter: commenterId,
      replying_to: replyingTo ?? null,
    },
  ])
  if (error) {
    throw error
  }
}

export async function getFullCommentById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(*), projects(*)')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] as FullComment
}

export async function getReplies(supabase: SupabaseClient, rootId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('replying_to', rootId)
  if (error) {
    throw error
  }
  return data as Comment[]
}
