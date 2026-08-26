import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/db/supabase-server'

import type { NextRequest } from 'next/server'

// Hands a Manifund session to a sibling Manifund-run site (currently Trace at
// trace.manifund.org), so people don't need a second sign-in. Both sites use
// this Supabase project, so it is the same account either way — only the
// session cookie is per-host, and this passes the tokens across.
//
//   /sso?next=https://trace.manifund.org/auth/handoff&then=/suggestions
//
// Signed in  -> redirect to `next` with the tokens in the URL fragment, which
//               browsers never send to a server; the target swaps them for its
//               own cookie and clears them from the address bar.
// Signed out -> send them through the normal login page and come back here.
//
// `next` is checked against an allowlist: an open redirect here would hand
// someone's session to whatever host they named.
const ALLOWED_TARGETS = ['https://trace.manifund.org']

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const next = url.searchParams.get('next') ?? ''
  const then = url.searchParams.get('then') ?? '/'

  const target = ALLOWED_TARGETS.find(
    (allowed) => next === allowed || next.startsWith(`${allowed}/`)
  )
  if (!target) {
    return NextResponse.json({ error: 'next must be an allowed Manifund site' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Log in, then come back here to complete the handoff.
    const login = new URL('/login', url.origin)
    login.searchParams.set('next', `/sso?next=${encodeURIComponent(next)}&then=${encodeURIComponent(then)}`)
    return NextResponse.redirect(login)
  }

  const handoff = new URL(next)
  handoff.hash = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    next: then.startsWith('/') ? then : '/',
  }).toString()
  return NextResponse.redirect(handoff)
}
