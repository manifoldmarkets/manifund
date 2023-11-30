import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { sortBy } from 'lodash'

export type Cause = Database['public']['Tables']['causes']['Row']
export type FullCause = Cause & { projects: { stage: string }[] }
export type MiniCause = { title: string; slug: string }

export async function listFullCauses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('causes')
    .select('*, projects(stage)')
  if (error) {
    throw error
  }
  return sortBy(data, [
    function (cause) {
      return cause.data.sort
    },
  ]) as FullCause[]
}

export async function listMiniCauses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('causes')
    .select('title, slug')
    .contains('data', JSON.stringify({ open: true }))
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
