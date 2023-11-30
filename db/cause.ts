import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { sortBy } from 'lodash'

export type Cause = Omit<
  Database['public']['Tables']['causes']['Row'],
  'cert_params'
> & { cert_params: CertParams | null }
export type FullCause = Cause & { projects: { stage: string }[] }
export type MiniCause = { title: string; slug: string }

export type CertParams = {
  ammShares: number
  ammDollars: number | null
  minMinFunding: number
  proposalPhase: boolean
  ammOwnedByCreator: boolean
  defaultInvestorShares: number
  adjustableInvestmentStructure: boolean
}

export async function listFullCauses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('causes')
    .select('*, projects(stage)')
  if (error) {
    throw error
  }
  return sortBy(data, 'sort') as FullCause[]
}

export async function listMiniCauses(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('causes').select('title, slug')
  if (error) {
    throw error
  }
  return data as MiniCause[]
}

export async function listCauses(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('causes').select('*')
  if (error) {
    throw error
  }
  return data as Cause[]
}

export async function updateProjectCauses(
  supabase: SupabaseClient,
  causeSlugs: string[],
  projectId: string
) {
  await supabase
    .from('project_causes')
    .delete()
    .eq('project_id', projectId)
    .throwOnError()
  await supabase
    .from('project_causes')
    .insert(
      causeSlugs.map((slug) => ({ project_id: projectId, cause_slug: slug }))
    )
    .throwOnError()
}

export async function getCause(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('causes')
    .select('*')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Cause
}
