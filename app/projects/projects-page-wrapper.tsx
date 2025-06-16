'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/db/supabase-browser'
import { Col } from '@/components/layout/col'
import { FeedTabs } from './feed-tabs'
import { LandingSection } from './landing-section'
import type { FullComment } from '@/db/comment'
import type { FullTxn } from '@/db/txn'
import type { FullBid } from '@/db/bid'
import type { FullProject } from '@/db/project'
import type { SimpleCause } from '@/db/cause'

interface ProjectsPageWrapperProps {
  recentComments: FullComment[]
  recentDonations: FullTxn[]
  recentBids: FullBid[]
  projects: FullProject[]
  causesList: SimpleCause[]
}

export function ProjectsPageWrapper({
  recentComments,
  recentDonations,
  recentBids,
  projects,
  causesList,
}: ProjectsPageWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const searchParams = useSearchParams()

  const PAGE_SIZE = 20
  const page = parseInt(searchParams?.get('p') || '1')
  const start = (page - 1) * PAGE_SIZE

  const paginatedComments = recentComments.slice(start, start + PAGE_SIZE)
  const paginatedDonations = recentDonations.slice(start, start + PAGE_SIZE)
  const paginatedBids = recentBids.slice(start, start + PAGE_SIZE)

  useEffect(() => {
    const setupAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setIsAuthenticated(!!session)
      setUserId(session?.user?.id)
      setIsLoading(false)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session)
        setUserId(session?.user?.id)
        setIsLoading(false)
      })

      return subscription
    }

    let subscription: any = null

    setupAuth()
      .then((sub) => {
        subscription = sub
      })
      .catch((error) => {
        console.error('Error setting up auth:', error)
        setIsLoading(false)
      })

    return () => {
      if (subscription) {
        void subscription.unsubscribe()
      }
    }
  }, [supabase.auth])

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {(isLoading || !isAuthenticated) && <LandingSection />}
      <FeedTabs
        recentComments={paginatedComments}
        recentDonations={paginatedDonations}
        recentBids={paginatedBids}
        projects={projects}
        causesList={causesList}
        userId={userId}
      />
    </Col>
  )
}
