'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'

export default function ClientAuth() {
  const { supabase, session } = useSupabase()
  const user = session?.user

  return (
    <div className="max-w-md bg-dark-200">
      {user ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Signed in as {user.email}</h1>
          <button
            className="bg-rose-400 text-white rounded p-2"
            onClick={async () => {
              await supabase.auth.signOut()
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      )}
    </div>
  )
}
