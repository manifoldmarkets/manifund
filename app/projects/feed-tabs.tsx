'use client'
import { Comment } from '@/components/comment'
import { Donation } from '@/components/donations-history'
import { Col } from '@/components/layout/col'
import { Tabs } from '@/components/tabs'
import { FullTxn } from '@/db/txn'
import Link from 'next/link'
import { FullComment } from '@/db/comment'
import { useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/pagination'
import { useState } from 'react'
import { ProjectsDisplay } from '@/components/projects-display'
import { FullProject } from '@/db/project'
import { SimpleCause } from '@/db/cause'
import { Tag } from '@/components/tags'
import { Card } from '@/components/layout/card'
import { Bid } from './[slug]/bids'
import { FullBid } from '@/db/bid'

export function FeedTabs(props: {
  recentComments: FullComment[]
  recentDonations: FullTxn[]
  recentBids: FullBid[]
  projects: FullProject[]
  causesList: SimpleCause[]
}) {
  const { recentComments, recentDonations, recentBids, projects, causesList } =
    props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const [page, setPage] = useState(1)

  const ProjectsTab = (
    <Col className="gap-3">
      <p className="text-sm text-gray-600">
        Including projects in all stages and from all rounds.
      </p>
      <ProjectsDisplay
        projects={projects}
        defaultSort={'hot'}
        causesList={causesList}
      />
    </Col>
  )

  const PaginationWrapper = (
    <Pagination
      page={page}
      itemsPerPage={20}
      totalItems={140}
      setPage={setPage}
      savePageToQuery={true}
    />
  )

  const CommentsTab = (
    <>
      {PaginationWrapper}
      <Col className="gap-8">
        {recentComments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              comment={comment}
              commenter={comment.profiles}
              rxns={comment.comment_rxns}
              commentHref={`/projects/${comment.projects.slug}?tab=comments#${comment.id}`}
              projectTitle={comment.projects.title}
            />
          )
        })}
      </Col>
    </>
  )
  const DonationsTab = (
    <>
      {PaginationWrapper}
      <Col className="gap-8">
        {recentDonations.map((txn) => {
          return <FullDonation txn={txn} key={txn.id} />
        })}
      </Col>
    </>
  )
  const OffersTab = (
    <>
      {PaginationWrapper}
      <Col className="gap-8">
        {recentBids.map((bid) => {
          return <FullOffer bid={bid} key={bid.id} />
        })}
      </Col>
    </>
  )
  return (
    <div>
      <Tabs
        tabs={[
          {
            name: 'All projects',
            id: 'projects',
            display: ProjectsTab,
            count: projects.length,
          },
          {
            name: 'Comments',
            id: 'comments',
            display: CommentsTab,
          },
          {
            name: 'Donations',
            id: 'donations',
            display: DonationsTab,
          },
          {
            name: 'Offers',
            id: 'offers',
            display: OffersTab,
          },
        ]}
        currentTabId={currentTabId}
      />
      {PaginationWrapper}
    </div>
  )
}

function FullDonation(props: { txn: FullTxn }) {
  const { txn } = props
  // Ignore donations not associated with projects
  if (!txn.projects || !txn.profiles || txn.token !== 'USD') {
    return null
  }
  return (
    <Col>
      <Link
        href={`/projects/${txn.projects.slug}?tab=${
          txn.projects.type === 'grant' ? 'donations' : 'shareholders'
        }`}
        className="w-fit"
      >
        <Tag text={txn.projects.title} className="hover:bg-orange-200" />
      </Link>
      <Card className="rounded-tl-sm !p-1">
        <Donation txn={txn} key={txn.id} />
      </Card>
    </Col>
  )
}

function FullOffer(props: { bid: FullBid }) {
  const { bid } = props
  return (
    <Col>
      <Link
        href={`/projects/${bid.projects.slug}?tab=${
          bid.projects.type === 'grant' ? 'donations' : 'shareholders'
        }`}
        className="w-fit"
      >
        <Tag text={bid.projects.title} className="hover:bg-orange-200" />
      </Link>
      <Card className="rounded-tl-sm !p-1">
        <Bid bid={bid} showValuation={false} />
      </Card>
    </Col>
  )
}
