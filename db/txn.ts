import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Profile } from './profile'
import { Project } from './project'

export type Txn = Database['public']['Tables']['txns']['Row']
export type TxnAndProject = Txn & { projects?: Project }
export type TxnAndProfiles = Txn & { profiles?: Profile }

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getIncomingTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*)')
    .eq('to_id', user)
  if (error) {
    throw error
  }
  return data as TxnAndProject[]
}

export async function getIncomingProjectTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*)')
    .eq('to_id', user)
    .not('project', 'is', 'null')
  if (error) {
    throw error
  }
  return data as TxnAndProject[]
}

export async function getOutgoingTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*)')
    .eq('from_id', user)
  if (error) {
    throw error
  }
  return data as TxnAndProject[]
}

export async function getOutgoingProjectTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*)')
    .eq('from_id', user)
    .not('project', 'is', 'null')
  if (error) {
    throw error
  }
  return data as TxnAndProject[]
}

export async function getTxnsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, profiles!txns_to_id_fkey(*)')
    .eq('project', project)
  if (error) {
    throw error
  }
  return data as TxnAndProfiles[]
}
