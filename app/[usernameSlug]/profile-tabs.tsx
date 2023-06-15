'use client'
import { Profile, ProfileAndBids } from '@/db/profile'
import { useSearchParams } from 'next/navigation'
import { Bid, BidAndProject } from '@/db/bid'
import { Tabs } from '@/components/tabs'
import { FullProject, Project, ProjectTransfer } from '@/db/project'
import { ProposalBids } from './user-proposal-bids'
import { ActiveBids } from './user-active-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import { RichContent } from '@/components/editor'
import { BalanceDisplay } from './balance-display'
import {
  calculateUserBalance,
  calculateUserSpendableFunds,
  categorizeTxn,
} from '@/utils/math'
import { Txn, FullTxn } from '@/db/txn'
import { calculateWithdrawBalance } from '@/utils/math'
import { DonateBox } from '@/components/donate-box'
import { OutgoingDonationsHistory } from './user-donations'

export function ProfileTabs(props: {
  profile: Profile
  projectsPendingTransfer: Project[]
  projects: FullProject[]
  bids: BidAndProject[]
  txns: FullTxn[]
  userProfile: ProfileAndBids | null
  userTxns: Txn[] | null
  userProjectsPendingTransfer: Project[]
}) {
  const {
    profile,
    projectsPendingTransfer,
    projects,
    bids,
    txns,
    userProfile,
    userTxns,
    userProjectsPendingTransfer,
  } = props
  const isOwnProfile = userProfile?.id === profile.id
  const proposalBids = bids.filter(
    (bid) => bid.projects.stage === 'proposal' && bid.status === 'pending'
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
      txnType === 'outgoing cash transfer' ||
      txnType === 'outgoing project donation'
    )
  })
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabName = searchParams.get('tab')
  const tabs = []
  const balance = calculateUserBalance(txns, profile.id)
  const withdrawBalance = calculateWithdrawBalance(
    txns,
    bids,
    profile.id,
    balance,
    profile.accreditation_status
  )
  const spendableBalance = calculateUserSpendableFunds(
    txns,
    profile.id,
    bids,
    projectsPendingTransfer ?? [],
    profile.accreditation_status,
    balance
  )
  const userSpendableBalance =
    userTxns && userProfile
      ? calculateUserSpendableFunds(
          userTxns,
          userProfile?.id,
          userProfile?.bids,
          userProjectsPendingTransfer ?? [],
          userProfile?.accreditation_status
        )
      : 0

  const portfolioCount =
    proposalBids.length +
    activeBids.length +
    notOwnProjectInvestments.length +
    donations.length
  tabs.push({
    name: 'Portfolio',
    href: '?tab=portfolio',
    count: portfolioCount,
    current: currentTabName === 'portfolio' || currentTabName === null,
    display: (
      <div className="flex flex-col gap-6">
        {profile.regranter_status && !isOwnProfile && userProfile && (
          <DonateBox
            charity={profile}
            userId={userProfile.id}
            userSpendableFunds={userSpendableBalance}
          />
        )}
        <BalanceDisplay
          balance={balance}
          withdrawBalance={withdrawBalance}
          spendableBalance={spendableBalance}
          accredited={profile.accreditation_status}
          isOwnProfile={isOwnProfile ?? undefined}
          userId={userProfile?.id ?? undefined}
        />
        {donations.length > 0 && (
          <OutgoingDonationsHistory
            donations={donations}
            projectsPendingTransfer={projectsPendingTransfer}
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
      </div>
    ),
  })
  if (isOwnProfile || projects.length > 0) {
    tabs.push({
      name: 'Projects',
      href: '?tab=projects',
      count: projects.length,
      current: currentTabName === 'projects',
      display: (
        <Projects
          projects={projects.filter(
            (project) =>
              project.project_transfers.filter(
                (transfer) => !transfer.transferred
              ).length === 0
          )}
        />
      ),
    })
  }
  if (profile.long_description) {
    tabs.push({
      name: 'About me',
      href: '?tab=about',
      count: 0,
      current: currentTabName === 'about',
      display: <RichContent content={profile.long_description} />,
    })
  }
  if (tabs.length > 0) {
    return <Tabs tabs={tabs} preTabSlug={`/${profile.username}`} />
  } else {
    return null
  }
}

export type Investment = {
  project?: Project // Undefined eg for txns that are just transfers of money
  numShares: number
  priceUsd: number
}
function compileInvestments(txns: FullTxn[], userId: string) {
  const projectTxns = txns.filter((txn) => txn.project)
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
