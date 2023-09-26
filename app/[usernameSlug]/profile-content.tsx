'use client'
import { Profile, ProfileAndBids } from '@/db/profile'
import { BidAndProject } from '@/db/bid'
import { FullProject, Project } from '@/db/project'
import { ProposalBids } from './profile-proposal-bids'
import { ActiveBids } from './profile-active-bids'
import { Investments } from './profile-investments'
import { Projects } from './profile-projects'
import { BalanceDisplay } from './balance-display'
import {
  calculateCharityBalance,
  calculateUserBalance,
  categorizeTxn,
} from '@/utils/math'
import { Txn, FullTxn } from '@/db/txn'
import { calculateCashBalance } from '@/utils/math'
import { DonateBox } from '@/components/donate-box'
import { OutgoingDonationsHistory } from './profile-donations'
import { CommentAndProject } from '@/db/comment'
import { ProfileComments } from './profile-comments'
import { RichContent } from '@/components/editor'
import { Row } from '@/components/layout/row'
import { useState } from 'react'
import clsx from 'clsx'

export function ProfileContent(props: {
  profile: Profile
  projects: FullProject[]
  comments: CommentAndProject[]
  bids: BidAndProject[]
  txns: FullTxn[]
  userProfile: ProfileAndBids | null
  userTxns: Txn[] | null
}) {
  const { profile, projects, comments, bids, txns, userProfile, userTxns } =
    props
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
  const donations = txns.filter((txn) => {
    const txnType = categorizeTxn(txn, profile.id)
    return (
      txnType === 'outgoing profile donation' ||
      txnType === 'outgoing project donation'
    )
  })
  const pendingDonateBids = bids.filter(
    (bid) => bid.status === 'pending' && bid.type === 'donate'
  )
  const balance = calculateUserBalance(txns, profile.id)
  const withdrawBalance = calculateCashBalance(
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
    userTxns && userProfile
      ? calculateCharityBalance(
          userTxns,
          userProfile?.bids,
          userProfile?.id,
          userProfile?.accreditation_status
        )
      : 0
  const visibleProjects = projects
    .filter(
      (project) =>
        project.project_transfers.filter((transfer) => !transfer.transferred)
          .length === 0
    )
    .filter((project) => project.stage !== 'hidden' || isOwnProfile)
  const visibleComments = comments.filter((comment) => {
    return comment.projects.stage !== 'hidden'
  })
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
        withdrawBalance={withdrawBalance}
        charityBalance={charityBalance}
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
      {(visibleProjects.length > 0 || isOwnProfile) && (
        <Projects projects={visibleProjects} />
      )}
      {visibleComments.length > 0 && (
        <ProfileComments comments={visibleComments} profile={profile} />
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className={clsx('bi bi-caret-right-fill', expanded && 'rotate-90')}
            viewBox="0 0 16 16"
          >
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
          </svg>
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
