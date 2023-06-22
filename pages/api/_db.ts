import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/db/database.types'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from '@/db/env'

export function createEdgeClient(req: NextRequest) {
  const res = NextResponse.next()
  return createMiddlewareClient<Database>(
    {
      req,
      res,
    },
    {
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
    }
  )
}

export function createAdminClient() {
  return createClient<Database>(
    SUPABASE_URL ?? '',
    SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}
