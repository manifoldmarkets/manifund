import { FullProject } from '@/db/project'
import { isBefore } from 'date-fns'
import { createAdminClient } from './_db'
import { sortBy } from 'es-toolkit'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  const projects = await listProjectsForAgreements(supabase)
  const AUSTIN_PROFILE_ID = '10bd8a14-4002-47ff-af4a-92b227423a74'
  for (const project of projects) {
    console.log(project.title)
    const createdDate = new Date(project.created_at)
    const v2StartDate = new Date('August 21, 2023')
    const v3StartDate = new Date('February 19, 2024')
    const version = isBefore(createdDate, v2StartDate)
      ? 1
      : isBefore(createdDate, v3StartDate)
      ? 2
      : 3
    const sortedTxns = sortBy(project.txns, ['created_at'])
    const firstUSDTxn = sortedTxns.find((t) => t.token === 'USD')
    const activationDate =
      firstUSDTxn && project.stage !== 'proposal' && project.stage !== 'draft'
        ? firstUSDTxn.created_at
        : null
    const signedDate = project.signed_agreement
      ? project.stage === 'proposal'
        ? '2024-03-22 12:00:00.000000+00'
        : activationDate
      : null
    const finalReport = project.comments.find(
      (c) => c.special_type === 'final report'
    )
    const completedDate =
      project.stage === 'complete'
        ? finalReport
          ? finalReport.created_at
          : project.round === 'ACX Mini-Grants'
          ? '2023-10-09 12:00:00.000000+00'
          : project.round === 'OP AI Worldviews Contest'
          ? '2023-09-29 12:00:00.000000+00'
          : project.round === 'ChinaTalk Essay Contest'
          ? '2024-02-12 12:00:00.000000+00'
          : '2030-09-29 12:00:00.000000+00' // Meant to flag special cases
        : null
    const { error } = await supabase
      .from('grant_agreements')
      .upsert(
        {
          project_id: project.id,
          version,
          lobbying_clause_excluded: project.lobbying,
          signed_at: signedDate,
          signatory_name: project.signed_agreement
            ? project.profiles.full_name
            : null,
          recipient_name: project.signed_agreement
            ? project.profiles.full_name
            : null,
          project_description: project.description,
          project_title: project.title,
          approved_at: project.approved ? activationDate : null,
          approved_by: project.signed_agreement ? AUSTIN_PROFILE_ID : null,
          // completed_at: completedDate,
        },
        { onConflict: 'project_id' }
      )
      .select()
    if (error) {
      console.error(error)
      return NextResponse.error()
    }
  }
}

export async function listProjectsForAgreements(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('projects')
    .select('*, profiles!projects_creator_fkey(*), txns(*), comments(*))')
    .order('created_at', { ascending: false })
    .throwOnError()
  return data as unknown as FullProject[]
}
