'use client'

// React hook that exposes the user object and auth methods

import { useSupabase } from '@/components/supabase-provider'
import { Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

export const useUser = () => {
  const { supabase } = useSupabase()

  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session))
  }, [supabase])

  return session?.user
}
