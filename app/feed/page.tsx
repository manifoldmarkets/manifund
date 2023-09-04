import { listMiniCauses } from '@/db/cause'
import { getRecentFullComments } from '@/db/comment'
import { listProjects } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { getRecentFullTxns } from '@/db/txn'
import { FeedTabs } from './feed-tabs'

export default async function FeedPage(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()
  const PAGE_SIZE = 20
  // Extract `page` from ?p=X param as an 1-indexed integer
  const page = parseInt(props.searchParams.p as string) || 1
  const start = (page - 1) * PAGE_SIZE

  const [recentComments, recentDonations, projects, causesList] =
    await Promise.all([
      getRecentFullComments(supabase, PAGE_SIZE, start),
      getRecentFullTxns(supabase, PAGE_SIZE, start),
      listProjects(supabase),
      listMiniCauses(supabase),
    ])
  return (
    <FeedTabs
      recentComments={recentComments}
      recentDonations={recentDonations}
      projects={projects}
      causesList={causesList}
    />
  )
}
