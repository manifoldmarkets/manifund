import { Suspense } from 'react'
import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { Col } from '@/components/layout/col'
import { ProjectsSection } from './projects-section'
import { CommentsSection } from './comments-section'
import { DonationsSection } from './donations-section'
import {
  getCachedHotProjects,
  getCachedRecentComments,
  getCachedRecentDonations,
  getCachedRecentBids,
  getCachedCauses,
} from '@/db/home-cached'

export const metadata: Metadata = {
  title: 'Home - Manifund',
  description: 'Discover and support impactful projects on Manifund',
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)

  return (
    <Col className="gap-8 px-3 py-5 sm:px-6">
      {/* Use Suspense boundaries for progressive loading */}
      <Suspense fallback={<SectionSkeleton title="Hot Projects" />}>
        <AsyncProjectsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Recent Comments" />}>
        <AsyncCommentsSection userId={user?.id} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Recent Activity" />}>
        <AsyncDonationsSection />
      </Suspense>
    </Col>
  )
}

// Async components for each section
async function AsyncProjectsSection() {
  const [projects, causesList] = await Promise.all([
    getCachedHotProjects(),
    getCachedCauses(),
  ])

  return <ProjectsSection projects={projects} causesList={causesList} />
}

async function AsyncCommentsSection({ userId }: { userId?: string }) {
  const comments = await getCachedRecentComments()
  return <CommentsSection comments={comments} userId={userId} />
}

async function AsyncDonationsSection() {
  const [donations, bids] = await Promise.all([
    getCachedRecentDonations(),
    getCachedRecentBids(),
  ])

  return <DonationsSection donations={donations} bids={bids} />
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </section>
  )
}
