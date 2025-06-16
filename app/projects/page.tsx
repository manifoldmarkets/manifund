import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { Col } from '@/components/layout/col'
import { FeedTabs } from './feed-tabs'
import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { getRecentFullBids } from '@/db/bid'
import { listSimpleCauses } from '@/db/cause'
import { listProjectCards } from '@/db/project'
import { LandingSection } from './landing-section'

// Page is dynamic due to cookies(), but listProjectCards is cached for 60s
export const revalidate = 60

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  const [
    initialProjects,
    causesList,
    recentComments,
    recentDonations,
    recentBids,
  ] = await Promise.all([
    listProjectCards(supabase, 1, 20),
    listSimpleCauses(supabase),
    getRecentFullComments(supabase, 20, 0),
    getRecentFullTxns(supabase, 20, 0),
    getRecentFullBids(supabase, 20, 0),
  ])

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {user === null && (
        <>
          <LandingSection />
          {/* <CausesSection /> */}
          {/* Or use <CausesWithFeatured /> to include active rounds */}
        </>
      )}

      {/* Use nested suspense to load the full feed after the fast feed */}
      <Suspense
        fallback={
          <Suspense fallback={<FeedTabsSkeleton />}>
            <FeedTabs
              recentComments={recentComments}
              recentDonations={recentDonations}
              recentBids={recentBids}
              projects={initialProjects}
              causesList={causesList}
              userId={user?.id}
            />
          </Suspense>
        }
      >
        <FeedTabs
          recentComments={recentComments}
          recentDonations={recentDonations}
          recentBids={recentBids}
          projects={initialProjects}
          causesList={causesList}
          userId={user?.id}
        />
      </Suspense>
    </Col>
  )
}

function FeedTabsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 w-full rounded bg-gray-200" />
      <div className="mt-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
