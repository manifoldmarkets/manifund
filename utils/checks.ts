import { getProjectAndBidsById } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'

export async function checkGrantFundingReady(
  supabase: SupabaseClient,
  projectId: string
) {
  const project = await getProjectAndBidsById(supabase, projectId)
  if (!project || !project.bids) {
    console.error('Project not found')
    return false
  }
  if (project.type !== 'grant') {
    console.error('Project is not a grant')
    return false
  } else {
    const totalDonated = project.bids
      .filter((bid) => bid.status === 'pending' && bid.type === 'donate')
      .reduce((acc, bid) => acc + bid.amount, 0)
    return (
      totalDonated >= project.min_funding &&
      project.approved &&
      project.signed_agreement
    )
  }
}
