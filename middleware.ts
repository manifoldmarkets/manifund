import { createMiddlewareSupabaseClient } from './db/supabase-server'
import { NextResponse } from 'next/server'
import { createMiddlewareClient, Session } from '@supabase/auth-helpers-nextjs'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const existingSession = await migrateSessionIfNeeded(req, res)

  let session = existingSession
  if (!session) {
    const supabase = createMiddlewareSupabaseClient(req, res)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const {
      data: { session: newSession },
    } = await supabase.auth.getSession()
    session = newSession
  }

  return res
}

async function migrateSessionIfNeeded(
  req: NextRequest,
  res: NextResponse
): Promise<Session | null> {
  try {
    const newSupabase = createMiddlewareSupabaseClient(req, res)
    const {
      data: { user },
    } = await newSupabase.auth.getUser()
    const {
      data: { session: newSession },
    } = await newSupabase.auth.getSession()

    if (!newSession) {
      return null
    }

    const oldSupabase = createMiddlewareClient({ req, res })
    const {
      data: { user: oldUser },
    } = await oldSupabase.auth.getUser()

    if (oldUser) {
      console.debug('Migrating session from auth-helpers to SSR format...')

      const { error: setError } = await newSupabase.auth.setSession({
        access_token: oldUser.access_token,
        refresh_token: oldUser.refresh_token,
      })

      if (setError) {
        console.debug('Failed to migrate session:', setError.message)
        return null
      }

      const oldCookies = req.cookies
        .getAll()
        .filter(
          (cookie) =>
            cookie.name.startsWith('sb-') &&
            cookie.name.endsWith('-auth-token') &&
            !cookie.name.includes('code-verifier')
        )

      for (const cookie of oldCookies) {
        res.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          domain: cookie.name.includes('localhost') ? 'localhost' : undefined,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
      }

      console.debug('Session migration completed successfully')
      return oldUser
    }

    return null
  } catch (error) {
    console.debug('Session migration failed:', error)
    return null
  }
}
