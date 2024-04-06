'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, Theme } from '@supabase/auth-ui-shared'
import { getURL } from '@/utils/constants'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ClientAuth(props: { profileComplete?: boolean }) {
  const { profileComplete } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const router = useRouter()
  const params = useSearchParams()
  const recommendedEmail = params?.get('email')
  const redirect = params?.get('redirect')
  if (user) {
    router.push(
      profileComplete
        ? redirect ?? '/projects'
        : `/edit-profile?redirectTo=${redirect}`
    )
  }
  if (user) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="relative flex h-20 w-20 animate-spin flex-col items-center justify-center rounded-full bg-orange-200 ">
          <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-full bg-orange-500" />
          <div className="z-10 h-16 w-16 rounded-full bg-gray-50" />
        </div>
      </div>
    )
  } else {
    return (
      <div className="bg-dark-200 max-w-md p-4">
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
          redirectTo={`${getURL()}/login?redirectTo=${redirect}`}
        />
      </div>
    )
  }
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
