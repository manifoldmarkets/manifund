import { getRecentFullComments } from '@/db/comment'
import { createServerClient } from '@/db/supabase-server'
import { getRecentFullTxns } from '@/db/txn'
import { FeedTabs } from './feed-tabs'

export default async function FeedPage(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()
  // Extract page from ?p=X param as an integer
  const PAGE_SIZE = 20
  const page = parseInt(props.searchParams.p as string) || 1
  const start = (page - 1) * PAGE_SIZE

  const recentComments = await getRecentFullComments(supabase, PAGE_SIZE, start)
  const recentDonations = await getRecentFullTxns(supabase, PAGE_SIZE, start)
  return (
    <FeedTabs
      recentComments={recentComments}
      recentDonations={recentDonations}
    />
  )
}
