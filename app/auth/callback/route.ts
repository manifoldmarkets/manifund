import { createServerSupabaseClient } from '@/db/supabase-server'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

// This is the endpoint that supabase will redirect to after the user has authenticated via oauth
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
