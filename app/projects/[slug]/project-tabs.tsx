'use client'
import { Comments } from './comments'
import { FullProject, TOTAL_SHARES } from '@/db/project'
import { Profile } from '@/db/profile'
import { useSearchParams } from 'next/navigation'
import { Bids } from './bids'
import { BidAndProfile } from '@/db/bid'
import { TxnAndProfiles } from '@/db/txn'
import { Shareholders } from './shareholders'
import { calculateFullTrades, FullTrade } from '@/utils/math'
import { Tabs } from '@/components/tabs'
import { DonationsHistory } from '@/components/donations-history'
import { CommentAndProfile } from '@/db/comment'
import { uniq } from 'lodash'
import { compareDesc } from 'date-fns'

export function ProjectTabs(props: {
  project: FullProject
  comments: CommentAndProfile[]
  bids: BidAndProfile[]
  txns: TxnAndProfiles[]
  userSpendableFunds: number
  userSellableShares: number
  userProfile?: Profile
  specialCommentPrompt?: string
}) {
  const {
    project,
    comments,
    bids,
    txns,
    userSpendableFunds,
    userSellableShares,
    userProfile,
    specialCommentPrompt,
  } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const trades = calculateFullTrades(txns)
  const creator = project.profiles
  const shareholders =
    (project.stage === 'active' || project.stage === 'complete') &&
    project.type === 'cert'
      ? calculateShareholders(trades, creator)
      : undefined
  const commenterContributions = getCommenterContributions(
    comments,
    bids,
    txns,
    shareholders
  )
  const tabs = [
    {
      name: 'Comments',
      id: 'comments',
      count: comments.length,
      display: (
        <Comments
          project={project}
          comments={comments}
          userProfile={userProfile}
          commenterContributions={commenterContributions}
          specialPrompt={specialCommentPrompt}
        />
      ),
    },
  ]

  if (
    ((project.stage === 'active' || project.stage === 'complete') &&
      project.type === 'cert') ||
    project.stage === 'proposal'
  ) {
    tabs.push({
      name:
        project.stage === 'active' || project.type === 'grant'
          ? 'Offers'
          : 'Bids',
      id: 'bids',
      count: bids.length,
      display: (
        <Bids
          bids={bids}
          project={project}
          userProfile={userProfile}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      ),
    })
  }
  if (shareholders) {
    tabs.push({
      name: 'Shareholders',
      id: 'shareholders',
      count: shareholders.length,
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
    (project.stage === 'active' || project.stage === 'complete') &&
    project.type === 'grant'
  ) {
    const donations = txns.filter(
      (txn) => txn.project === project.id && txn.token === 'USD' && !txn.bundle
    )
    tabs.push({
      name: 'Donations',
      id: 'donations',
      count: donations.length,
      display: <DonationsHistory donations={donations} />,
    })
  }

  return <Tabs tabs={tabs} currentTabId={currentTabId} />
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
  // Round to 2 decimal places for small arithmetic errors
  shareholdersArray.forEach((shareholder) => {
    shareholder.numShares = Math.round(shareholder.numShares * 100) / 100
  })
  return shareholdersArray.filter(
    (shareholder) =>
      shareholder.numShares > 0 || shareholder.profile.id === creator.id
  )
}

export function getCommenterContributions(
  comments: CommentAndProfile[],
  bids: BidAndProfile[],
  txns: TxnAndProfiles[],
  shareholders?: Shareholder[]
) {
  const commenterIds = uniq(comments.map((comment) => comment.commenter))
  const contributions = Object.fromEntries(
    commenterIds.map((commenterId) => [commenterId, ''])
  )
  commenterIds.forEach((commenterId) => {
    if (shareholders) {
      const holding = shareholders.find(
        (shareholder) => shareholder.profile.id === commenterId
      )
      if (holding) {
        contributions[commenterId] = `HOLDS ${
          (holding.numShares / TOTAL_SHARES) * 100
        }%`
      }
    }
    if (!contributions[commenterId] && txns) {
      const donations = txns.filter(
        (txn) =>
          txn.from_id === commenterId && txn.token === 'USD' && !txn.bundle
      )
      const totalDonated = donations.reduce(
        (total, txn) => total + txn.amount,
        0
      )
      if (totalDonated > 0) {
        contributions[commenterId] = `DONATED $${totalDonated}`
      }
    }
    if (!contributions[commenterId]) {
      const relevantBids = bids.filter(
        (bid) => bid.status === 'pending' && bid.bidder === commenterId
      )
      const sortedBids = relevantBids.sort((a, b) =>
        compareDesc(new Date(a.created_at), new Date(b.created_at))
      )
      const latestBid = sortedBids[0]
      if (latestBid) {
        contributions[commenterId] =
          latestBid.type === 'donate'
            ? `OFFERED $${relevantBids.reduce(
                (acc, bid) => acc + bid.amount,
                0
              )}`
            : latestBid.type === 'buy'
            ? `BUYING at $${latestBid.valuation}`
            : `SELLING at $${latestBid.valuation}`
      }
    }
  })
  return contributions
}
