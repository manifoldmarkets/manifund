'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSupabase } from './supabase-provider'

export default function SupabaseListener() {
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return null
}
