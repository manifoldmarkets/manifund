'use client'
import { Comments } from './comments'
import { FullProject, TOTAL_SHARES } from '@/db/project'
import { Profile } from '@/db/profile'
import { CommentAndProfile } from '@/db/comment'
import { useSearchParams } from 'next/navigation'
import { Bids } from './bids'
import { BidAndProfile } from '@/db/bid'
import { TxnAndProfiles } from '@/db/txn'
import { Shareholders } from './shareholders'
import { calculateFullTrades, FullTrade } from '@/utils/math'
import { Tabs } from '@/components/tabs'
import { Donations } from '@/components/donations'
import { sortBy } from 'lodash'

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
    ((project.stage === 'active' || project.stage === 'completed') &&
      project.type === 'cert') ||
    project.stage === 'proposal'
  ) {
    tabs.push({
      name:
        project.stage === 'active' || project.type === 'grant'
          ? 'Offers'
          : 'Bids',
      href: '?tab=bids',
      count: bids.length,
      current: currentTabName === 'bids',
      display: (
        <Bids
          bids={bids}
          project={project}
          user={user}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      ),
    })
  }
  if (
    (project.stage === 'active' || project.stage === 'completed') &&
    project.type === 'cert'
  ) {
    const shareholders = calculateShareholders(trades, creator)
    tabs.push({
      name: 'Shareholders',
      href: '?tab=shareholders',
      count: shareholders.length,
      current: currentTabName === 'shareholders',
      display: (
        <Shareholders
          shareholders={shareholders}
          trades={trades}
          creator={creator}
        />
      ),
    })
  }

  if (
    (project.stage === 'active' || project.stage === 'completed') &&
    project.type === 'grant'
  ) {
    const donations = txns.filter(
      (txn) => txn.project === project.id && txn.token === 'USD' && !txn.bundle
    )
    tabs.push({
      name: 'Donations',
      href: '?tab=donations',
      count: donations.length,
      current: currentTabName === 'donations',
      display: <Donations donations={donations} />,
    })
  }

  return <Tabs tabs={tabs} preTabSlug={`/projects/${project.slug}`} />
}

export type Shareholder = {
  profile: Profile
  numShares: number
}
export function calculateShareholders(trades: FullTrade[], creator: Profile) {
  const shareholders = Object.fromEntries(
    trades.map((trade) => [trade.toProfile.id, { numShares: 0 } as Shareholder])
  )
  shareholders[creator.id] = { profile: creator, numShares: 10000000 }
  for (const trade of trades) {
    shareholders[trade.toProfile.id].profile = trade.toProfile
    shareholders[trade.toProfile.id].numShares += trade.numShares
    shareholders[trade.fromProfile.id].numShares -= trade.numShares
  }
  const shareholdersArray = Object.values(shareholders) as Shareholder[]
  //round to 2 decimal places for small arithmetic errors
  shareholdersArray.forEach((shareholder) => {
    shareholder.numShares = Math.round(shareholder.numShares * 100) / 100
  })
  return shareholdersArray.filter(
    (shareholder) =>
      shareholder.numShares > 0 || shareholder.profile.id === creator.id
  )
}
