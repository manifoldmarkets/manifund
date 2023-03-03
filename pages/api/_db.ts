import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/db/database.types'

export function createEdgeClient(req: NextRequest) {
  const res = NextResponse.next()
  return createMiddlewareSupabaseClient<Database>({
    req,
    res,
  })
}

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}
