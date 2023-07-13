'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, Theme } from '@supabase/auth-ui-shared'
import { Button } from '@/components/button'
import { getURL } from '@/utils/constants'
import { useSearchParams } from 'next/navigation'

export default function ClientAuth() {
  const { supabase, session } = useSupabase()
  const user = session?.user
  const params = useSearchParams()
  const recommendedEmail = params?.get('email')

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
        <>
          {recommendedEmail && (
            <span className="text-gray-600">
              Make sure to create an account with the same email that your grant
              notification was sent to (
              <span className="font-bold text-black">{recommendedEmail}</span>
              ).
            </span>
          )}
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: manifundTheme }}
            providers={['google']}
            redirectTo={`${getURL()}`}
          />
        </>
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
