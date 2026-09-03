import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row']

export const OPEN_STATUSES = ['awaiting_recipient', 'ready_to_pay', 'pending_approval'] as const

export async function getWithdrawalRequestsByUser(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('profile_id', userId)
    .order('requested_at', { ascending: false })
    .throwOnError()
  return (data ?? []) as WithdrawalRequest[]
}

export async function getOpenWithdrawalRequest(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('profile_id', userId)
    .in('status', OPEN_STATUSES as unknown as string[])
    .maybeSingle()
    .throwOnError()
  return (data ?? null) as WithdrawalRequest | null
}

export async function getOpenWithdrawalRequests(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .in('status', OPEN_STATUSES as unknown as string[])
    .order('requested_at', { ascending: true })
    .throwOnError()
  return (data ?? []) as WithdrawalRequest[]
}
