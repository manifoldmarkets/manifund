'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { Theme } from '@supabase/auth-ui-react/dist/esm/src/types'

export default function ClientAuth() {
  const { supabase, session } = useSupabase()
  const user = session?.user

  return (
    <div className="bg-dark-200 max-w-md">
      {user ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Signed in as {user.email}</h1>
          <button
            className="rounded bg-rose-400 p-2 text-white"
            onClick={async () => {
              await supabase.auth.signOut()
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: manifundTheme }} />
      )}
    </div>
  )
}

const manifundTheme: Theme = {
  default: {
    ...ThemeSupa.default,
    colors: {
      ...ThemeSupa.default.colors,
      brand: '#f97316', // orange-500
      brandAccent: '#ea580c', // orange-600
    },
    fonts: {},
  },
}
