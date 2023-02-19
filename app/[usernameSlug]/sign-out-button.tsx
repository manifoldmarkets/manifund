'use client'

import { Button } from '@/components/button'
import { useSupabase } from '@/components/supabase-provider'

export function SignOutButton() {
  const { supabase } = useSupabase()
  return (
    <Button
      color="gray-outline"
      className="max-w-xs"
      onClick={async () => {
        await supabase.auth.signOut()
      }}
    >
      Sign out
    </Button>
  )
}
