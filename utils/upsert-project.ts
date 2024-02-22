import { Project, TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'

export async function giveCreatorShares(
  supabase: SupabaseClient,
  id: string,
  creator: string
) {
  const txn = {
    from_id: null,
    to_id: creator,
    amount: TOTAL_SHARES,
    token: id,
    project: id,
    type: 'mint cert',
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error(error)
  }
}

export async function upvoteOwnProject(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
) {
  const { error } = await supabase.from('project_votes').insert([
    {
      project_id: projectId,
      voter_id: userId,
      magnitude: 1,
    },
  ])
  if (error) {
    console.error(error)
  }
}

export async function saveProject(supabase: SupabaseClient, project: Project) {
  const { error } = await supabase.from('projects').insert([project])
  if (error) {
    console.error(error)
  }
}
