import { Database } from '@/db/database.types'
import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Profile } from './profile'
import { Project, TOTAL_SHARES } from './project'

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

export async function makeTrade(
  buyer: string,
  seller: string,
  amount: number,
  valuation: number,
  projectId: string
) {
  const supabase = createAdminClient()
  const addSharesTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount: (amount / valuation) * TOTAL_SHARES,
      from_id: seller,
      to_id: buyer,
      project: projectId,
      token: projectId,
    })
    if (error) {
      throw error
    }
  }
  addSharesTxn()
  const addUSDTxn = async () => {
    const { error } = await supabase.from('txns').insert({
      amount,
      from_id: buyer,
      to_id: seller,
      project: projectId,
      token: 'USD',
    })
    if (error) {
      throw error
    }
  }
  addUSDTxn()
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
