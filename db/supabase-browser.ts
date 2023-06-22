import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

export const createClient = () =>
  createBrowserSupabaseClient<Database>({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  })
