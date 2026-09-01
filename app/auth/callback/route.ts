import { createServerSupabaseClient } from '@/db/supabase-server'
import { safeNext } from '@/utils/safe-next'
import { NextResponse } from 'next/server'

import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

// Email links may name any of these; anything else is not a link we sent.
const OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change']

function isOtpType(value: string | null): value is EmailOtpType {
  return !!value && (OTP_TYPES as string[]).includes(value)
}

// This is the endpoint that supabase will redirect to after the user has authenticated via oauth or email confirmation
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  // new URL(next, origin) would follow an absolute URL straight off the site,
  // and this value now comes from a query string the user can set.
  const next = safeNext(requestUrl.searchParams.get('next'))

  const failed = (name: string, message: string) => {
    // Redirect to login with error details so the user sees what went wrong
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', name)
    loginUrl.searchParams.set('error_description', message)
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createServerSupabaseClient()

  // Two shapes of link arrive here.
  //
  // token_hash comes from templates built on `{{ .TokenHash }}`. It carries no
  // PKCE verifier, so it still works when the mail is opened somewhere other
  // than the browser that asked for it -- a phone, an in-app mail viewer, a
  // machine whose cookies have since been cleared. That is the ordinary case
  // for a password reset, so prefer it.
  //
  // code is the PKCE flow, used by OAuth and by `{{ .ConfirmationURL }}`
  // links. Exchanging it needs the verifier cookie written when the flow
  // started, so it only succeeds in that same browser.
  if (tokenHash) {
    if (!isOtpType(type)) return failed('invalid_request', 'This link is malformed.')
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) return failed(error.name, error.message)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return failed(error.name, error.message)
  }

  // Redirect to the requested destination after sign in
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
