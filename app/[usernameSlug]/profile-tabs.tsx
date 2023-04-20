'use client'
import { Profile } from '@/db/profile'
import { useSearchParams } from 'next/navigation'
import { Bid, BidAndProject } from '@/db/bid'
import { Tabs } from '@/components/tabs'
import { FullProject } from '@/db/project'
import { Investment } from './page'
import { ProposalBids } from './user-proposal-bids'
import { ActiveBids } from './user-active-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import { RichContent } from '@/components/editor'
import { BalanceBox } from './balance-box'
import { calculateUserBalance } from '@/utils/math'
import { Txn, TxnAndProject } from '@/db/txn'
import { sortBy } from 'lodash'
import { BANK_ID } from '@/db/env'

export function ProfileTabs(props: {
  profile: Profile
  isOwnProfile?: boolean
  projects: FullProject[]
  bids: BidAndProject[]
  investments: Investment[]
  txns: TxnAndProject[]
}) {
  const { profile, isOwnProfile, projects, bids, investments, txns } = props
  const proposalBids = bids.filter(
    (bid) => bid.projects.stage === 'proposal' && bid.status === 'pending'
  )
  const activeBids = bids.filter(
    (bid) => bid.projects.stage === 'active' && bid.status === 'pending'
  )
  const notOwnProjectInvestments = investments.filter((investment) => {
    return investment.project && investment.project.creator !== profile.id
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

  const portfolioCount =
    proposalBids.length + activeBids.length + notOwnProjectInvestments.length
  if (portfolioCount > 0) {
    tabs.push({
      name: 'Portfolio',
      href: '?tab=portfolio',
      count: portfolioCount,
      current: currentTabName === 'portfolio' || currentTabName === null,
      display: (
        <div className="flex flex-col gap-10">
          <BalanceBox
            balance={balance}
            withdrawBalance={withdrawBalance}
            accredited={profile.accreditation_status}
          />
          {proposalBids.length > 0 && (
            <ProposalBids bids={proposalBids} isOwnProfile={isOwnProfile} />
          )}
          {activeBids.length > 0 && (
            <ActiveBids bids={activeBids} isOwnProfile={isOwnProfile} />
          )}
          {notOwnProjectInvestments.length > 0 && (
            <Investments investments={notOwnProjectInvestments} />
          )}
        </div>
      ),
    })
  }
  if (isOwnProfile || projects.length > 0) {
    tabs.push({
      name: 'Projects',
      href: '?tab=projects',
      count: projects.length,
      current:
        currentTabName === 'projects' ||
        (currentTabName === null && tabs.length === 0),
      display: <Projects projects={projects} />,
    })
  }
  if (profile.long_description) {
    tabs.push({
      name: 'About me',
      href: '?tab=about',
      count: 0,
      current:
        currentTabName === 'about' ||
        (currentTabName === null && tabs.length === 0),
      display: <RichContent content={profile.long_description} />,
    })
  }
  if (tabs.length > 0) {
    return <Tabs tabs={tabs} preTabSlug={`/${profile.username}`} />
  } else {
    return null
  }
}

function calculateWithdrawBalance(
  txns: Txn[],
  bids: Bid[],
  userId: string,
  balance: number,
  accreditationStatus: boolean
) {
  let nonWithdrawBalance = 0
  const sortedTxns = sortBy(txns, 'created_at')
  sortedTxns.forEach((txn) => {
    const txnType = categorizeTxn(txn, userId)
    if (txnType === 'non-dollar') return
    if (txn.to_id === userId) {
      if (!txnWithdrawable(txnType, accreditationStatus)) {
        nonWithdrawBalance += txn.amount
      }
    } else {
      if (txnCharitable(txnType, accreditationStatus)) {
        nonWithdrawBalance -= txn.amount
      }
    }
    nonWithdrawBalance = Math.max(nonWithdrawBalance, 0)
  })
  bids.forEach((bid) => {
    if (bid.status === 'pending' && bid.type === 'buy') {
      nonWithdrawBalance += bid.amount
    }
  })

  return Math.max(balance - nonWithdrawBalance, 0)
}

type TxnType =
  | 'incoming cash transfer'
  | 'outgoing cash transfer'
  | 'share purchase'
  | 'share sale'
  | 'own-project share sale'
  | 'withdraw'
  | 'deposit'
  | 'incoming project donation'
  | 'outgoing project donation'
  | 'non-dollar'

function categorizeTxn(txn: TxnAndProject, userId: string) {
  if (txn.token === 'USD') {
    if (txn.to_id === userId) {
      if (txn.project) {
        if (txn.projects?.creator === userId) {
          if (txn.bundle) {
            return 'own-project share sale'
          } else {
            return 'incoming project donation'
          }
        } else {
          return 'share sale'
        }
      } else {
        if (txn.from_id === BANK_ID) {
          return 'deposit'
        } else {
          return 'incoming cash transfer'
        }
      }
    } else {
      if (txn.project) {
        if (txn.bundle) {
          return 'share purchase'
        } else {
          return 'outgoing project donation'
        }
      } else {
        if (txn.to_id === BANK_ID) {
          return 'withdraw'
        } else {
          return 'outgoing cash transfer'
        }
      }
    }
  } else {
    return 'non-dollar'
  }
}

// For incoming txns only
function txnWithdrawable(txnType: TxnType, accreditationStatus: boolean) {
  if (txnType === 'incoming cash transfer') {
    return false
  }
  if (
    txnType === 'share sale' ||
    (txnType === 'deposit' && !accreditationStatus)
  ) {
    return false
  }
  return true
}

// For outgoing txns only
function txnCharitable(txnType: TxnType, accreditationStatus: boolean) {
  if (
    txnType === 'outgoing cash transfer' ||
    txnType === 'outgoing project donation'
  ) {
    return true
  }
  if (txnType === 'share purchase' && !accreditationStatus) {
    return true
  }
  return false
}
