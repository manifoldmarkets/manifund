import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type Round = Database['public']['Tables']['rounds']['Row']

export async function getRounds(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('rounds')
    .select('*')
    .order('auction_close_date', { ascending: true })
    .throwOnError()
  return data as Round[]
}

export async function getRoundBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase.from('rounds').select('*').eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Round
}
