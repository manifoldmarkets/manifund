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

export function FeedTabs(props: {
  recentComments: FullComment[]
  recentDonations: FullTxn[]
}) {
  const { recentComments, recentDonations } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const [page, setPage] = useState(1)
  console.log('FeedTabs page', page)

  const CommentsTab = (
    <Col className="gap-8">
      <Pagination
        page={page}
        itemsPerPage={20}
        totalItems={140}
        setPage={setPage}
        savePageToQuery={true}
      />
      {recentComments.map((comment) => {
        return (
          <Comment
            key={comment.id}
            comment={comment}
            commenter={comment.profiles}
            project={comment.projects}
          />
        )
      })}
    </Col>
  )
  const DonationsTab = (
    <Col className="gap-8">
      <Pagination
        page={page}
        itemsPerPage={20}
        totalItems={140}
        setPage={setPage}
        savePageToQuery={true}
      />
      {recentDonations.map((txn) => {
        return <FullDonation txn={txn} key={txn.id} />
      })}
    </Col>
  )
  return (
    <div>
      <Tabs
        tabs={[
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
  console.log('txn', txn)
  return (
    <Col>
      <Link
        href={`/projects/${txn.projects.slug}`}
        className="truncate overflow-ellipsis text-xs font-semibold text-orange-600 hover:underline"
      >
        {txn.projects.title}
      </Link>
      <Donation txn={txn} key={txn.id} />
    </Col>
  )
}
