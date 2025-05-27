import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/db/database.types'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from '@/db/env'

export function createEdgeClient(req: NextRequest) {
  const res = NextResponse.next()
  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value)
          res.cookies.set(name, value, options)
        })
      },
    },
  })
}

export function createAdminClient() {
  return createClient<Database>(
    SUPABASE_URL ?? '',
    SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}
