import { createServerSupabaseClient } from '@/db/supabase-server'
import { safeNext } from '@/utils/safe-next'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

// This is the endpoint that supabase will redirect to after the user has authenticated via oauth or email confirmation
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // new URL(next, origin) would follow an absolute URL straight off the site,
  // and this value now comes from a query string the user can set.
  const next = safeNext(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Redirect to login with error details so the user sees what went wrong
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', error.name)
      loginUrl.searchParams.set('error_description', error.message)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect to the requested destination after sign in
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
