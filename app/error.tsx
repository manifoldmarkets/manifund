'use client'

import { SiteLink } from '@/components/site-link'

export default function Error(props: { error: Error; reset: () => void }) {
  return (
    <div>
      Error thrown: {JSON.stringify(props.error)}
      <br />
      <br />
      This might be due to an auth mismatch between dev and prod Supabase; try{' '}
      <SiteLink followsLinkClass href="/login" className="text-orange-500">
        signing out.
      </SiteLink>
    </div>
  )
}
