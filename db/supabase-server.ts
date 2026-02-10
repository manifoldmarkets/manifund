import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} from './env'

// For Server Components, API Routes, and general server-side usage
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// for cached functions and other contexts where cookies aren't needed
export function createPublicSupabaseClient() {
  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}


// For admin operations that need elevated privileges
export function createAdminSupabaseClient() {
  return createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
}
