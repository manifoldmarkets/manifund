import { getRecentFullComments } from '@/db/comment'
import { createServerClient } from '@/db/supabase-server'
import { getRecentFullTxns } from '@/db/txn'
import { FeedTabs } from './feed-tabs'

export default async function FeedPage() {
  const supabase = createServerClient()

  const recentComments = await getRecentFullComments(supabase, 20)
  const recentDonations = await getRecentFullTxns(supabase, 20)
  return (
    <FeedTabs
      recentComments={recentComments}
      recentDonations={recentDonations}
    />
  )
}
