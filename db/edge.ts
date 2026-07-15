import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/db/database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/db/env'
import { getUser } from '@/db/profile'

// Re-exported for the many Pages Router routes that import it from here;
// canonical definition lives in db/supabase-admin.ts.
export { createAdminClient } from '@/db/supabase-admin'

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

// Standard first line of most Pages Router API handlers: build a
// cookie-authed client for this request and look up the caller.
// `user` is null when not signed in; handlers decide how to respond.
export async function getUserAndClient(req: NextRequest) {
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  return { supabase, user }
}
