import { createServerClient } from '@/db/supabase-server'
import { getAllProjectTxns } from '@/db/txn'
import { Stats } from './stats'

export async function StatsServerComponent() {
  const supabase = createServerClient()
  const txns = await getAllProjectTxns(supabase)
  return <Stats txns={txns} />
}
