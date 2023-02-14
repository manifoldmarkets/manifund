'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export default function ClientAuth() {
  const { supabase } = useSupabase()

  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session))
  }, [supabase])

  return (
    <div className="max-w-md bg-dark-200">
      {session?.user ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold">
            Signed in as {session.user.email}
          </h1>
          {/* <pre>{JSON.stringify(session?.user, null, 2)}</pre> */}
        </div>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      )}
    </div>
  )
}
