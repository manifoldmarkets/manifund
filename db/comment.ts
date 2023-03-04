import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { HTMLContent, JSONContent } from '@tiptap/react'
import { Project } from './project'
import { Profile } from './profile'
import { createAdminClient } from '@/pages/api/_db'

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
  htmlContent: HTMLContent,
  project: Project,
  commenter: Profile
) {
  const { error } = await supabase.from('comments').insert([
    {
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
        projectTitle: project.title,
        projectUrl: `https://manifund.org/projects/${project.slug}`,
        commenterUsername: commenter.username,
        commenterAvatarUrl: commenter.avatar_url,
        projectCreatorId: project.creator,
        htmlContent,
      }),
    })
    const newProject = await response.json()
  }
}
