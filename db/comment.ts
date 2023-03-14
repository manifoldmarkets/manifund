import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { HTMLContent, JSONContent } from '@tiptap/react'
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
  htmlContent: HTMLContent,
  project: Project,
  commenter: Profile
) {
  const commentId = uuid()
  const { error } = await supabase.from('comments').insert([
    {
      id: commentId,
      content,
      project: project.id,
      commenter: commenter.id,
    },
  ])
  if (error) {
    throw error
  } else {
    const response = await fetch('/api/comment-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentId,
        htmlContent,
      }),
    })
    const newProject = await response.json()
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
