import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export type ProjectEval = Database['public']['Tables']['project_evals']['Row']
export type ProfileTrust = Database['public']['Tables']['profile_trust']['Row']

export async function getUserEvals(userId: string, supabase: SupabaseClient) {
  const { data: evals, error } = await supabase
    .from('project_evals')
    .select('*')
    .eq('evaluator_id', userId)
  if (error) {
    throw error
  }
  return evals as ProjectEval[]
}

export async function getProfileTrusts(userId: string, supabase: SupabaseClient) {
  const { data: profileTrusts, error } = await supabase
    .from('profile_trust')
    .select('*')
    .eq('truster_id', userId)
  if (error) {
    throw error
  }
  return profileTrusts as ProfileTrust[]
}

export async function getAllEvals(supabase: SupabaseClient) {
  const { data: evals, error } = await supabase.from('project_evals').select('*')
  if (error) {
    throw error
  }
  return evals as ProjectEval[]
}

export async function getAllTrusts(supabase: SupabaseClient) {
  const { data: profileTrusts, error } = await supabase.from('profile_trust').select('*')
  if (error) {
    throw error
  }
  return profileTrusts as ProfileTrust[]
}
