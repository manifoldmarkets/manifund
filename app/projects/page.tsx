import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { getRecentFullBids } from '@/db/bid'
import { listSimpleCauses } from '@/db/cause'
import { listProjects } from '@/db/project'
import { createPublicSupabaseClient } from '@/db/supabase-server'
import { ProjectsPageWrapper } from './projects-page-wrapper'

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function Projects() {
  // this does not use cookies or searchParams, so ISR will work
  const supabase = createPublicSupabaseClient()

  // Load all data for ISR - pagination/filtering will be done client-side
  const PAGE_SIZE = 100 // Increase to load more data upfront

  const [projects, recentComments, recentDonations, recentBids, causesList] =
    await Promise.all([
      listProjects(supabase),
      getRecentFullComments(supabase, PAGE_SIZE, 0),
      getRecentFullTxns(supabase, PAGE_SIZE, 0),
      getRecentFullBids(supabase, PAGE_SIZE, 0),
      listSimpleCauses(supabase),
    ])

  return (
    <ProjectsPageWrapper
      recentComments={recentComments}
      recentDonations={recentDonations}
      recentBids={recentBids}
      projects={projects}
      causesList={causesList}
    />
  )
}
