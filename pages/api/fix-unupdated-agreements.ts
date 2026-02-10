import { ProjectAndProfile } from '@/db/project'
import { createAdminClient } from '@/db/edge'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { GrantAgreement } from '@/db/grant_agreement'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  // Fix projects where they were signed but not recorded in the agreements table
  const projects = await listMismatchedProjects(supabase)
  console.log(projects?.length)
  for (const project of projects) {
    console.log(project.title)
    const { error } = await supabase
      .from('grant_agreements')
      .upsert(
        {
          project_id: project.id,
          version: 3,
          signed_at: '2024-04-04 12:00:00.000000+00',
          signatory_name: project.profiles.full_name,
          recipient_name: project.profiles.full_name,
          project_description: project.description,
          project_title: project.title,
        },
        { onConflict: 'project_id' }
      )
      .select()
    if (error) {
      console.error(error)
      return NextResponse.error()
    }
  }
  // Fix projects where they were not actually approved but the agreement says approved
  const reverseMismatchedProjects = await listReverseMismatchedProjects(
    supabase
  )
  console.log(reverseMismatchedProjects?.length)
  for (const project of reverseMismatchedProjects) {
    console.log(project.title)
    const { error } = await supabase
      .from('grant_agreements')
      .update({ approved_at: null, approved_by: null })
      .eq('project_id', project.id)
    if (error) {
      console.error(error)
      return NextResponse.error()
    }
  }
  console.log('done')
}

type ProjectProfileAndAgreement = ProjectAndProfile & {
  grant_agreements: GrantAgreement
}
export async function listMismatchedProjects(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('projects')
    .select('*, profiles!projects_creator_fkey(*), grant_agreements(*)')
    .eq('round', 'ACX Grants 2024')
    .eq('type', 'cert')
    .eq('signed_agreement', true)
    .throwOnError()
  return data?.filter(
    (p) => p.grant_agreements.recipient_name === null
  ) as ProjectProfileAndAgreement[]
}

export async function listReverseMismatchedProjects(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('projects')
    .select('*, profiles!projects_creator_fkey(*), grant_agreements(*)')
    .eq('round', 'ACX Grants 2024')
    .eq('type', 'cert')
    .is('approved', null)
    .throwOnError()
  return data?.filter(
    (p) => p.grant_agreements.approved_at !== null
  ) as ProjectProfileAndAgreement[]
}
