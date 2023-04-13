import { getProfileByUsername, getUser, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { getTxnAndProjectsByUser, Txn, TxnAndProject } from '@/db/txn'
import { Bid, getBidsByUser } from '@/db/bid'
import { getProjectsByUser, Project } from '@/db/project'
import { ProfileTabs } from './profile-tabs'
import { calculateUserBalance } from '@/utils/math'
import { BANK_ID } from '@/db/env'
import { sortBy } from 'lodash'

export const revalidate = 0

export type Investment = {
  project?: Project // Undefined eg for txns that are just transfers of money
  num_shares: number
  price_usd: number
}

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = (await getProfileByUsername(
    supabase,
    usernameSlug
  )) as Profile
  const projects = await getProjectsByUser(supabase, profile.id)
  const bids = await getBidsByUser(supabase, profile.id)
  const isOwnProfile = user?.id === profile?.id
  const txns = await getTxnAndProjectsByUser(supabase, profile.id)
  const investments = await compileInvestments(txns, profile.id)
  const balance = calculateUserBalance(txns, profile.id)
  const withdrawBalance = calculateWithdrawBalance(
    txns,
    bids,
    profile.id,
    balance,
    profile.accreditation_status
  )

  return (
    <div className="flex flex-col p-5">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        balance={balance}
        withdrawBalance={withdrawBalance}
      />
      <div className="flex flex-col gap-10">
        <ProfileTabs
          isOwnProfile={isOwnProfile}
          profile={profile}
          projects={projects}
          bids={bids}
          investments={investments}
        />
        {isOwnProfile && (
          <div className="mt-5 flex justify-center">
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  )
}

async function compileInvestments(txns: TxnAndProject[], userId: string) {
  const projectTxns = txns.filter((txn) => txn.project)
  let investments: Investment[] = []

  projectTxns.forEach((txn) => {
    let aggInvestment = investments.find(
      (investment) => investment.project?.id === txn.project
    )
    const incoming = txn.to_id === userId
    if (txn.token === 'USD') {
      if (aggInvestment) {
        aggInvestment.price_usd += incoming ? txn.amount : -txn.amount
      } else {
        investments.push({
          project: txn.projects,
          num_shares: 0,
          price_usd: incoming ? txn.amount : -txn.amount,
        })
      }
    } else {
      if (aggInvestment) {
        aggInvestment.num_shares += incoming ? txn.amount : -txn.amount
      } else {
        investments.push({
          project: txn.projects,
          num_shares: incoming ? txn.amount : -txn.amount,
          price_usd: 0,
        })
      }
    }
  })
  return investments as Investment[]
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
