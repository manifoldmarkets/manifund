'use client'

import { useSupabase } from '@/db/supabase-provider'

export function SignOutButton() {
  const { supabase } = useSupabase()
  return (
    <button
      className="max-w-xs rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 shadow hover:bg-gray-300"
      onClick={async () => {
        await supabase.auth.signOut()
      }}
    >
      Sign out
    </button>
  )
}
