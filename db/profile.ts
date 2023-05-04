import { Database } from '@/db/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Txn } from '@/db/txn'
import { Bid } from './bid'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileAndTxns = Profile & { txns: Txn[] }
export type ProfileAndBids = Profile & { bids: Bid[] }

export function isAdmin(user: User | null) {
  const ADMINS = ['rachel.weinberg12@gmail.com', 'akrolsmir@gmail.com']
  return ADMINS.includes(user?.email ?? '')
}

export async function getProfileById(
  supabase: SupabaseClient,
  id: string = ''
) {
  if (!id) {
    return null
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
  if (error) {
    console.log('get profile by id', error)
    throw error
  }
  return data[0] ? data[0] : null
}

export async function getProfileAndBidsById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, bids(*)')
    .eq('id', id)
  if (error) {
    console.log('get profile & bids by id', error)
    throw error
  }
  return data[0] as ProfileAndBids
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string = ''
) {
  if (!username) {
    return { id: null, username }
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
  if (error) {
    console.log('get profile by username', error)

    throw error
  }
  return data[0] ? data[0] : { id: null, username }
}
export async function getProfileAndBidsByUsername(
  supabase: SupabaseClient,
  username: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, bids(*)')
    .eq('username', username)
  if (error) {
    console.log('get profile and bids by username', error)
    throw error
  }
  return data[0] as ProfileAndBids
}

export async function getUser(supabase: SupabaseClient<Database>) {
  const resp = await supabase.auth.getUser()
  return resp.data.user
}

export type MiniProfile = Pick<
  Profile,
  'id' | 'username' | 'avatar_url' | 'full_name' | 'type'
>
export async function getAllMiniProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, full_name, type')
  if (error) {
    throw error
  }
  return data as MiniProfile[]
}

// Doesn't account for charities giving to other organizations yet
export async function listOrgs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, txns!txns_to_id_fkey(*)')
    .eq('type', 'org')
  if (error) {
    throw error
  }
  return data as ProfileAndTxns[]
}

export async function getRegranters(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('regranter_status', true)
    .throwOnError()
  return data as Profile[]
}
