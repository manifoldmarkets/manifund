import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Project } from './project'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Txn = Database['public']['Tables']['txns']['Row']
export type TxnAndProject = Txn & { projects: Project }

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getIncomingTxnsByUser(
  supabase: SupabaseClient,
  user: string
) {
  console.log('user', user)
  const { data, error } = await supabase
    .from('txns')
    .select('*, projects(*)')
    .eq('to_id', user)
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
