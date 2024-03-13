import { createClient } from '@supabase/supabase-js'
import 'server-only'

import type { Database } from './database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

// Unauth-ed version of the client, for server-side caching
export const createServerClientCached = () =>
  createClient<Database>(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')
