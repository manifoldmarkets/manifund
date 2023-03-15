import 'server-only'

import { headers, cookies } from 'next/headers'
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from './database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

export const createServerClient = () =>
  createServerComponentSupabaseClient<Database>({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    headers,
    cookies,
  })
