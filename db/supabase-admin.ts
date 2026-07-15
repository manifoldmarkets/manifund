import { createClient } from '@supabase/supabase-js'
import { Database } from '@/db/database.types'
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@/db/env'

// Service-role client for admin operations that bypass RLS.
// Works in any server context (App Router, Pages Router, edge runtime).
export function createAdminClient() {
  return createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
}
