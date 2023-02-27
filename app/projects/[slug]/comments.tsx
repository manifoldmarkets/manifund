import { Profile } from '@/db/profile'
import { CommentsDisplay } from './comments-display'
import { getCommentsByProject } from '@/db/comment'
import { createServerClient } from '@/db/supabase-server'

export async function Comments(props: {
  project: string
  profile: Profile | null
}) {
  const { project, profile } = props
  const supabase = createServerClient()
  const comments = await getCommentsByProject(supabase, project)
  return (
    <CommentsDisplay
      comments={comments}
      project={props.project}
      profile={props.profile}
    />
  )
}
