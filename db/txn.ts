import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Profile } from './profile'
import { Project } from './project'

export type Txn = Database['public']['Tables']['txns']['Row']
export type TxnAndProject = Txn & { projects?: Project }
export type FullTxn = Txn & { projects?: Project } & { profiles?: Profile }
export type TxnAndProfiles = Txn & { profiles?: Profile }
export type TxnType = Database['public']['Tables']['txns']['Row']['type']

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getFullTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  if (!user) {
    return []
  }
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*), profiles!txns_to_id_fkey(*)')
    .or(`from_id.eq.${user},to_id.eq.${user}`)
  if (error) {
    throw error
  }
  return (data as FullTxn[]) ?? ([] as FullTxn[])
}

export async function getTxnAndProjectsByUser(
  supabase: SupabaseClient,
  user: string
) {
  if (!user) {
    return []
  }
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(creator, stage, type)')
    .or(`from_id.eq.${user},to_id.eq.${user}`)
  if (error) {
    throw error
  }
  return (data as TxnAndProject[]) ?? ([] as TxnAndProject[])
}

export async function getTxnsByUser(supabase: SupabaseClient, user: string) {
  if (!user) {
    return []
  }
  const { data, error } = await supabase
    .from('txns')
    .select('*')
    .or(`from_id.eq.${user},to_id.eq.${user}`)
  if (error) {
    throw error
  }
  return (data as Txn[]) ?? ([] as Txn[])
}

export async function getIncomingTxnsByUserWithDonor(
  supabase: SupabaseClient,
  user: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, profiles!txns_from_id_fkey(*)')
    .eq('to_id', user)
  if (error) {
    throw error
  }
  return data as TxnAndProfiles[]
}

export async function getTxnsByProject(
  supabase: SupabaseClient,
  project: string
) {
  const { data, error } = await supabase
    .from('txns')
    .select('*, profiles!txns_from_id_fkey(*)')
    .eq('project', project)
  if (error) {
    throw error
  }
  return data as TxnAndProfiles[]
}

export async function getAllTxns(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('txns')
    .select(
      '*, profiles!txns_from_id_fkey(regranter_status), projects(creator, stage, type)'
    )
  if (error) {
    throw error
  }
  return data as FullTxn[]
}

export async function getRecentFullTxns(
  supabase: SupabaseClient,
  limit: number = 10,
  offset: number = 0
) {
  const { data } = await supabase
    .from('txns')
    .select('*, profiles!txns_from_id_fkey(*), projects(*)')
    // Only return results that have profiles & projects
    .not('project', 'is', null)
    .not('from_id', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)
    .throwOnError()
  return data as FullTxn[]
}
