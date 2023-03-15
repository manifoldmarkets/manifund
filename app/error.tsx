'use client'

import { SiteLink } from '@/components/site-link'
import { useSupabase } from '@/db/supabase-provider'

export default function Error(props: { error: Error; reset: () => void }) {
  const { session } = useSupabase()

  return (
    <div>
      Error thrown: {JSON.stringify(props.error)}
      <br />
      Check console logs for more info.
      {!!session?.user && (
        <div className="mt-4">
          This might be due to an auth mismatch between dev and prod Supabase;
          try{' '}
          <SiteLink followsLinkClass href="/login" className="text-orange-500">
            signing out.
          </SiteLink>
        </div>
      )}
    </div>
  )
}
