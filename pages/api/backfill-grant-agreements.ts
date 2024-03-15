import { FullProject, listProjects } from '@/db/project'
import { isBefore } from 'date-fns'
import { createAdminClient } from './_db'
import { sortBy } from 'lodash'
import { SupabaseClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  const supabase = createAdminClient()
  const projects = await listProjects(supabase)
  for (const project of projects) {
    const createdDate = new Date(project.created_at)
    const v2StartDate = new Date('August 21, 2023')
    const v3StartDate = new Date('February 19, 2024')
    const version = isBefore(createdDate, v2StartDate)
      ? 1
      : isBefore(createdDate, v3StartDate)
      ? 2
      : 3
    const sortedTxns = sortBy(project.txns, 'created_at')
    const firstUSDTxn = sortedTxns.find((t) => t.token === 'USD')
    const activationDate =
      firstUSDTxn && project.stage !== 'proposal' && project.stage !== 'draft'
        ? firstUSDTxn.created_at
        : null
    const finalReport = project.comments.find(
      (c) => c.special_type === 'final report'
    )
    const completedDate =
      finalReport && project.stage === 'complete'
        ? finalReport.created_at
        : null
    const AUSTIN_PROFILE_ID = '10bd8a14-4002-47ff-af4a-92b227423a74'
    await supabase
      .from('grant_agreements')
      .update({
        version,
        lobbying_clause_excluded: project.lobbying,
        signed_at: activationDate,
        signatory_name: project.profiles.full_name,
        recipient_name: project.profiles.full_name,
        project_description: project.description,
        project_title: project.title,
        approved_at: activationDate,
        approvedBy: AUSTIN_PROFILE_ID,
        completed_at: completedDate,
      })
      .eq('project_id', project.id)
  }
}

export async function listProjectsForAgreements(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('projects')
    .select(
      '*, profiles!projects_creator_fkey(*), txns(*), comments(*), project_transfers(*)'
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .throwOnError()
  // Scary type conversion!
  return data as unknown as FullProject[]
}
