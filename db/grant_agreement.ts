import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export type GrantAgreement = Database['public']['Tables']['grant_agreements']['Row'] & {
  profiles: { full_name: string; username: string }
}
export async function getGrantAgreement(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('grant_agreements')
    .select('*, profiles(full_name, username)')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) {
    console.error(error)
    throw error
  }
  return data as GrantAgreement | null
}
