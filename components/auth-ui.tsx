'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { Theme } from '@supabase/auth-ui-react/dist/esm/src/types'
import { Button } from '@/components/button'

export default function ClientAuth() {
  const { supabase, session } = useSupabase()
  const user = session?.user

  return (
    <div className="bg-dark-200 max-w-md">
      {user ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Signed in as {user.email}</h1>
          <Button
            onClick={async () => {
              await supabase.auth.signOut()
            }}
          >
            Sign out
          </Button>
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
