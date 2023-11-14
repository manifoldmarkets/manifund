'use client'
import { Profile } from '@/db/profile'
import { BidAndProject } from '@/db/bid'
import { FullProject, Project } from '@/db/project'
import { ProposalBids } from './profile-proposal-bids'
import { ActiveBids } from './profile-active-bids'
import { Investments } from './profile-investments'
import { Projects } from './profile-projects'
import { BalanceDisplay } from './balance-display'
import { calculateCharityBalance, calculateUserBalance } from '@/utils/math'
import { FullTxn, TxnAndProject } from '@/db/txn'
import { calculateCashBalance } from '@/utils/math'
import { DonateBox } from '@/components/donate-box'
import { OutgoingDonationsHistory } from './profile-donations'
import { CommentAndProject } from '@/db/comment'
import { ProfileComments } from './profile-comments'
import { RichContent } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { useState } from 'react'
import clsx from 'clsx'
import { RightCarrotIcon } from '@/components/icons'

export function ProfileContent(props: {
  profile: Profile
  projects: FullProject[]
  comments: CommentAndProject[]
  bids: BidAndProject[]
  txns: FullTxn[]
  userProfile: Profile | null
  userTxns: TxnAndProject[] | null
  userBids: BidAndProject[] | null
}) {
  const {
    profile,
    projects,
    comments,
    bids,
    txns,
    userProfile,
    userTxns,
    userBids,
  } = props
  const isOwnProfile = userProfile?.id === profile.id
  const proposalBids = bids.filter(
    (bid) =>
      bid.projects.stage === 'proposal' &&
      bid.status === 'pending' &&
      bid.type !== 'donate'
  )
  const activeBids = bids.filter(
    (bid) => bid.projects.stage === 'active' && bid.status === 'pending'
  )
  const investments = compileInvestments(txns, profile.id)
  const notOwnProjectInvestments = investments.filter((investment) => {
    return investment.project && investment.project.creator !== profile.id
  })
  const donations = txns.filter(
    (txn) =>
      (txn.type === 'profile donation' || txn.type === 'project donation') &&
      txn.from_id === profile.id
  )
  const pendingDonateBids = bids.filter(
    (bid) => bid.status === 'pending' && bid.type === 'donate'
  )
  const balance = calculateUserBalance(txns, profile.id)
  const cashBalance = calculateCashBalance(
    txns,
    bids,
    profile.id,
    profile.accreditation_status
  )
  const charityBalance = calculateCharityBalance(
    txns,
    bids,
    profile.id,
    profile.accreditation_status
  )
  const userCharityBalance =
    userTxns && userBids && userProfile
      ? calculateCharityBalance(
          userTxns,
          userBids,
          userProfile?.id,
          userProfile?.accreditation_status
        )
      : 0
  const relevantProjects = projects
    .filter(
      (project) =>
        project.project_transfers.filter((transfer) => !transfer.transferred)
          .length === 0
    )
    .filter((project) => project.stage !== 'hidden' || isOwnProfile)
  return (
    <div className="flex flex-col gap-6">
      {profile.regranter_status && !isOwnProfile && userProfile && (
        <DonateBox
          charity={profile}
          profile={userProfile}
          maxDonation={userCharityBalance}
        />
      )}
      <BalanceDisplay
        balance={balance}
        // Hack to get around old accounting system which means some cash balances are negative
        cashBalance={Math.max(cashBalance, 0)}
        charityBalance={charityBalance + Math.min(cashBalance, 0)}
        accredited={profile.accreditation_status}
        isOwnProfile={isOwnProfile ?? undefined}
        userId={userProfile?.id ?? undefined}
      />
      {profile.long_description && (
        <AboutMeSection content={profile.long_description} />
      )}
      {(donations.length > 0 || pendingDonateBids.length > 0) && (
        <OutgoingDonationsHistory
          donations={donations}
          pendingDonateBids={pendingDonateBids}
        />
      )}
      {notOwnProjectInvestments.length > 0 && (
        <Investments investments={notOwnProjectInvestments} />
      )}
      {activeBids.length > 0 && (
        <ActiveBids bids={activeBids} isOwnProfile={isOwnProfile} />
      )}
      {proposalBids.length > 0 && (
        <ProposalBids bids={proposalBids} isOwnProfile={isOwnProfile} />
      )}
      {(relevantProjects.length > 0 || isOwnProfile) && (
        <Projects projects={relevantProjects} />
      )}
      {comments.length > 0 && (
        <ProfileComments comments={comments} profile={profile} />
      )}
    </div>
  )
}

export type Investment = {
  project?: Project // Undefined eg for txns that are just transfers of money
  numShares: number
  priceUsd: number
}
function compileInvestments(txns: FullTxn[], userId: string) {
  const projectTxns = txns.filter((txn) => txn.project && txn.bundle)
  let investments: Investment[] = []

  projectTxns.forEach((txn) => {
    let aggInvestment = investments.find(
      (investment) => investment.project?.id === txn.project
    )
    const incoming = txn.to_id === userId
    if (txn.token === 'USD') {
      if (aggInvestment) {
        aggInvestment.priceUsd += incoming ? txn.amount : -txn.amount
      } else {
        investments.push({
          project: txn.projects,
          numShares: 0,
          priceUsd: incoming ? txn.amount : -txn.amount,
        })
      }
    } else {
      if (aggInvestment) {
        aggInvestment.numShares += incoming ? txn.amount : -txn.amount
      } else {
        investments.push({
          project: txn.projects,
          numShares: incoming ? txn.amount : -txn.amount,
          priceUsd: 0,
        })
      }
    }
  })
  return investments as Investment[]
}

function AboutMeSection(props: { content: any }) {
  const { content } = props
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex flex-col gap-2 rounded-md bg-white p-4 ring-2 ring-orange-600">
      <Row className="items-center gap-2 text-sm text-gray-900">
        <button onClick={() => setExpanded(!expanded)}>
          <RightCarrotIcon
            className={clsx(expanded && 'rotate-90')}
            color="black"
          />
        </button>
        About Me
      </Row>
      <div className="text-sm text-gray-700">
        <RichContent
          content={content}
          className={clsx('text-sm', !expanded && 'line-clamp-2')}
        />
      </div>
    </div>
  )
}
