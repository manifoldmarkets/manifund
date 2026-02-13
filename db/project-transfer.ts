import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { Project } from './project'

export type ProjectTransfer = Database['public']['Tables']['project_transfers']['Row']
export type ProjectTransferAndProject = ProjectTransfer & {
  projects: Project
}

export async function getTransfersByEmail(supabase: SupabaseClient, recipientEmail: string) {
  const { data, error } = await supabase
    .from('project_transfers')
    .select('*, projects(*)')
    .eq('recipient_email', recipientEmail)
  if (error) {
    throw error
  }
  return data as ProjectTransferAndProject[]
}

export async function getIncompleteTransfers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('project_transfers')
    .select('*, projects(*)')
    .eq('transferred', false)
  if (error) {
    throw error
  }
  return data as ProjectTransferAndProject[]
}
