'use client'

import { useSupabase } from '@/db/supabase-provider'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, Theme } from '@supabase/auth-ui-shared'
import { Button } from '@/components/button'
import { getURL } from '@/utils/constants'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function ClientAuth(props: { redirectTo?: string }) {
  const { redirectTo } = props
  const { supabase, session } = useSupabase()
  const user = session?.user
  const router = useRouter()
  if (user && redirectTo) {
    router.push(redirectTo)
  }
  const params = useSearchParams()
  const recommendedEmail = params?.get('email')
  if (user) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex h-36 w-36 animate-spin items-center justify-center rounded-full bg-gradient-to-tr from-gray-100 to-gray-300">
          <div className="h-28 w-28 items-center justify-center rounded-full bg-white"></div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="bg-dark-200 max-w-md">
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
          redirectTo={`${getURL()}/edit-profile`}
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
