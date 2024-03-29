import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/react'
import { Project } from './project'
import { Profile } from './profile'
import uuid from 'react-uuid'
import { BidAndProfile } from './bid'

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentAndProfile = Comment & { profiles: Profile }
export type FullComment = Comment & { profiles: Profile } & {
  projects: Project
}
export type CommentAndProject = Comment & { projects: Project }

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
  replyingTo?: string,
  specialType?: Comment['special_type']
) {
  const { error } = await supabase.from('comments').insert([
    {
      content,
      project: projectId,
      commenter: commenterId,
      replying_to: replyingTo ?? null,
      special_type: specialType ?? null,
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

export async function getCommentsByUser(
  supabase: SupabaseClient,
  commenterId: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, projects(id, title, slug, stage)')
    .eq('commenter', commenterId)
  if (error) {
    throw error
  }
  return data as CommentAndProject[]
}

export async function getRecentFullComments(
  supabase: SupabaseClient,
  size: number = 10,
  start: number = 0
) {
  const { data } = await supabase
    .from('comments')
    .select('*, profiles(*), projects!inner(*)')
    .neq('projects.stage', 'hidden')
    .order('created_at', { ascending: false })
    .range(start, start + size)
    .throwOnError()
  return data as FullComment[]
}
