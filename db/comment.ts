import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/react'
import { Project } from './project'
import { Profile } from './profile'

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentRxn = Database['public']['Tables']['comment_rxns']['Row']
export type CommentAndProfile = Comment & { profiles: Profile }
export type FullComment = Comment & { profiles: Profile } & {
  projects: Project
} & { comment_rxns: CommentRxn[] }
export type CommentAndProject = Comment & { projects: Project }
export type CommentAndProfileAndRxns = Comment & { profiles: Profile } & {
  comment_rxns: CommentRxn[]
}
export type CommentAndProjectAndRxns = Comment & { projects: Project } & {
  comment_rxns: CommentRxn[]
}
export type CommentAndProfileAndProject = Comment & { profiles: Profile } & {
  projects: Project
}

export async function getCommentsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select(
      '*, profiles!comments_commenter_fkey(*), comment_rxns(reactor_id, reaction)'
    )
    .eq('project', project)
  if (error) {
    throw error
  }
  return data as CommentAndProfileAndRxns[]
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

export async function getCommentById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles!comments_commenter_fkey(*), projects(*)')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] as CommentAndProfileAndProject
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
    .select(
      '*, projects(id, title, slug, stage), comment_rxns(reactor_id, reaction)'
    )
    .eq('commenter', commenterId)
  if (error) {
    throw error
  }
  return data as CommentAndProjectAndRxns[]
}

export async function getRecentFullComments(
  supabase: SupabaseClient,
  size: number = 10,
  start: number = 0
) {
  const { data } = await supabase
    .from('comments')
    .select(
      '*, profiles!comments_commenter_fkey(*), projects!inner(*), comment_rxns(reactor_id, reaction)'
    )
    .neq('projects.stage', 'hidden')
    .order('created_at', { ascending: false })
    .range(start, start + size)
    .throwOnError()
  return data as FullComment[]
}

export async function getMinimalCommentFromId(
  supabase: SupabaseClient,
  commentId: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, projects(slug)')
    .eq('id', commentId)
  if (error) {
    throw error
  }
  return data[0] as CommentAndProject
}
