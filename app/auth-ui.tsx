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
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />

      <div className="p-4">
        <pre>{JSON.stringify(session?.user, null, 2)}</pre>
      </div>
    </div>
  )
}
