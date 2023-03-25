'use client'
import clsx from 'clsx'
import { Comments } from './comments'
import { FullProject } from '@/db/project'
import { Profile } from '@/db/profile'
import { CommentAndProfile } from '@/db/comment'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bids } from './bids'
import { BidAndProfile } from '@/db/bid'
import { TxnAndProfiles } from '@/db/txn'
import { Shareholders } from './shareholders'
import { calculateFullTrades } from '@/utils/math'
import { Tabs } from '@/components/tabs'

export function ProjectTabs(props: {
  project: FullProject
  comments: CommentAndProfile[]
  user: Profile | null
  bids: BidAndProfile[]
  txns: TxnAndProfiles[]
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    project,
    comments,
    user,
    bids,
    txns,
    userSpendableFunds,
    userSellableShares,
  } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabName = searchParams.get('tab')
  const trades = calculateFullTrades(txns)
  const creator = project.profiles

  const tabs = [
    {
      name: 'Comments',
      href: '?tab=comments',
      count: comments.length,
      current: currentTabName === 'comments' || currentTabName === null,
      display: <Comments project={project} comments={comments} user={user} />,
    },
  ]

  if (
    project.stage === 'active' ||
    project.stage === 'completed' ||
    project.stage === 'proposal'
  ) {
    tabs.push({
      name: project.stage === 'active' ? 'Offers' : 'Bids',
      href: '?tab=bids',
      count: bids.length,
      current: currentTabName === 'bids',
      display: (
        <Bids
          bids={bids}
          stage={project.stage}
          user={user}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      ),
    })
  }
  if (project.stage === 'active' || project.stage === 'completed') {
    tabs.push({
      name: 'Shareholders',
      href: '?tab=shareholders',
      count: 0,
      current: currentTabName === 'shareholders',
      display: <Shareholders trades={trades} creator={creator} />,
    })
  }

  return <Tabs tabs={tabs} preTabSlug={`/projects/${project.slug}`} />
}
