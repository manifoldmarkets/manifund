import { createServerSupabaseClient } from '@/db/supabase-server'
import { getAllProjectTxns } from '@/db/txn'
import { Stats } from './stats'

export async function StatsServerComponent() {
  const supabase = await createServerSupabaseClient()
  const txns = await getAllProjectTxns(supabase)
  return <Stats txns={txns} />
}
