import { SupabaseClient } from '@supabase/supabase-js'

// Permanently removes a user and everything they created. Deleting the projects
// cascades to their txns/bids/comments; deleting the profile cascades to bids,
// votes, evals, follows, reactions, etc.; deleting the auth user frees the email.
// Callers must pass a service-role admin client. Throws on the first failure so
// the caller can decide how to surface it.
export async function superbanUser(adminSupabase: SupabaseClient, userId: string) {
  const { error: projectsError } = await adminSupabase
    .from('projects')
    .delete()
    .eq('creator', userId)
  if (projectsError) {
    throw new Error(`Failed to delete projects: ${projectsError.message}`)
  }

  const { error: commentsError } = await adminSupabase
    .from('comments')
    .delete()
    .eq('commenter', userId)
  if (commentsError) {
    throw new Error(`Failed to delete comments: ${commentsError.message}`)
  }

  const { error: profileError } = await adminSupabase.from('profiles').delete().eq('id', userId)
  if (profileError) {
    throw new Error(`Failed to delete profile: ${profileError.message}`)
  }

  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
  if (authError) {
    throw new Error(`Failed to delete auth user: ${authError.message}`)
  }
}
