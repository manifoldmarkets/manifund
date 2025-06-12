import { Col } from '@/components/layout/col'
import { FeedTabs } from './feed-tabs'
import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { getRecentFullBids } from '@/db/bid'
import { listSimpleCauses } from '@/db/cause'
import { listProjects } from '@/db/project'
import { LandingSection } from './landing-section'
import { createPublicSupabaseClient } from '@/db/supabase-server'
import { headers } from 'next/headers'

// Enable ISR with 60 second revalidation
export const revalidate = 60

// Static page component - no cookies/auth
export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Use public client for static data
  const publicSupabase = createPublicSupabaseClient()

  // Get auth state from middleware headers
  const headersList = await headers()
  const isAuthenticated = headersList.get('x-user-authenticated') === 'true'
  const userId = headersList.get('x-user-id') || undefined

  const PAGE_SIZE = 20
  const page = parseInt(props.searchParams?.p as string) || 1
  const tab = props.searchParams?.tab as string
  const shouldLoadProjects = !tab || tab === 'projects'
  const start = (page - 1) * PAGE_SIZE

  // Load all data with public client
  const [projects, recentComments, recentDonations, recentBids, causesList] =
    await Promise.all([
      shouldLoadProjects ? listProjects(publicSupabase) : Promise.resolve([]),
      getRecentFullComments(publicSupabase, PAGE_SIZE, start),
      getRecentFullTxns(publicSupabase, PAGE_SIZE, start),
      getRecentFullBids(publicSupabase, PAGE_SIZE, start),
      listSimpleCauses(publicSupabase),
    ])

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {/* Show landing section only for non-authenticated users */}
      {!isAuthenticated && <LandingSection />}
      <FeedTabs
        recentComments={recentComments}
        recentDonations={recentDonations}
        recentBids={recentBids}
        projects={projects}
        causesList={causesList}
        userId={userId}
      />
    </Col>
  )
}
