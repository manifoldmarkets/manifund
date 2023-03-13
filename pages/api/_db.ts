import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/db/database.types'
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@/db/keys'

export function createEdgeClient(req: NextRequest) {
  const res = NextResponse.next()
  return createMiddlewareSupabaseClient<Database>({
    req,
    res,
  })
}

export function createAdminClient() {
  return createClient<Database>(
    SUPABASE_URL ?? '',
    SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}
