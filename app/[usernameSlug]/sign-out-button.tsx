'use client'

import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { supabase } = useSupabase()
  const router = useRouter()
  return (
    <button
      className="max-w-xs rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 shadow hover:bg-gray-300"
      onClick={async () => {
        await supabase.auth.signOut()
        router.push('/')
        // Re-render server components so cached signed-in UI is dropped
        router.refresh()
      }}
    >
      Sign out
    </button>
  )
}
