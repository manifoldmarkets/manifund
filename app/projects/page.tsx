import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getUser } from '@/db/profile'
import { Col } from '@/components/layout/col'
import { FeedTabs } from './feed-tabs'
import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { getRecentFullBids } from '@/db/bid'
import { listSimpleCauses, getSomeFullCauses } from '@/db/cause'
import { LandingSection } from './landing-section'
import { CausesSection } from './causes-section'

// Make this a dynamic route that's revalidated every 24h
export const revalidate = 86400 // 24 hours

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)

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
            <AsyncFeedTabs
              searchParams={props.searchParams}
              userId={user?.id}
              projectLimit={30}
            />
          </Suspense>
        }
      >
        <AsyncFeedTabs
          searchParams={props.searchParams}
          userId={user?.id}
          projectLimit={300}
        />
      </Suspense>
    </Col>
  )
}

// Separate component for async feed data
async function AsyncFeedTabs({
  searchParams,
  userId,
  projectLimit,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  userId?: string
  projectLimit?: number
}) {
  const PAGE_SIZE = 20
  const page = parseInt(searchParams?.p as string) || 1
  const tab = searchParams?.tab as string
  // Hack for faster loading: don't load projects on other tabs
  // Ideally, we'd structure NextJS routing to only load the needed data`
  const limit = tab && tab !== 'projects' ? 0 : projectLimit
  const start = (page - 1) * PAGE_SIZE

  const supabase = await createServerSupabaseClient()
  const [projects, recentComments, recentDonations, recentBids, causesList] =
    await Promise.all([
      listProjects(supabase, limit),
      getRecentFullComments(supabase, PAGE_SIZE, start),
      getRecentFullTxns(supabase, PAGE_SIZE, start),
      getRecentFullBids(supabase, PAGE_SIZE, start),
      listSimpleCauses(supabase),
    ])

  return (
    <FeedTabs
      recentComments={recentComments}
      recentDonations={recentDonations}
      recentBids={recentBids}
      projects={projects}
      causesList={causesList}
      userId={userId}
    />
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
