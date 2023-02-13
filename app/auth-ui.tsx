'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Auth } from '@supabase/auth-ui-react'

export default function ClientAuth() {
  const { supabase } = useSupabase()

  return <Auth supabaseClient={supabase} />
}
