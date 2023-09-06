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
import { MiniCause } from '@/db/cause'
import { getURL } from '@/utils/constants'
import { Tag } from '@/components/tags'
import { Card } from '@/components/layout/card'

export function FeedTabs(props: {
  recentComments: FullComment[]
  recentDonations: FullTxn[]
  projects: FullProject[]
  causesList: MiniCause[]
}) {
  const { recentComments, recentDonations, projects, causesList } = props
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
        defaultSort={'newest first'}
        sortOptions={[
          'votes',
          'newest first',
          'oldest first',
          'price',
          'percent funded',
          'number of comments',
        ]}
        causesList={causesList}
      />
    </Col>
  )

  const CommentsTab = (
    <>
      <Pagination
        page={page}
        itemsPerPage={20}
        totalItems={140}
        setPage={setPage}
        savePageToQuery={true}
      />
      <Col className="gap-8">
        {recentComments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              comment={comment}
              commenter={comment.profiles}
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
      <Pagination
        page={page}
        itemsPerPage={20}
        totalItems={140}
        setPage={setPage}
        savePageToQuery={true}
      />
      <Col className="gap-8">
        {recentDonations.map((txn) => {
          return <FullDonation txn={txn} key={txn.id} />
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
            count: 0,
          },
          {
            name: 'Donations',
            id: 'donations',
            display: DonationsTab,
            count: 0,
          },
        ]}
        currentTabId={currentTabId}
      />
      <Pagination
        page={page}
        itemsPerPage={20}
        totalItems={140}
        setPage={setPage}
        savePageToQuery={true}
      />
    </div>
  )
}

function FullDonation(props: { txn: FullTxn }) {
  const { txn } = props
  // Ignore donations not associated with projects
  if (!txn.projects || !txn.profiles) {
    return null
  }
  return (
    <Col>
      <Link
        href={`/projects/${txn.projects.slug}?tab=donations`}
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
