import { getProfileByUsername, getUser, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import {
  getIncomingTxnsByUser,
  getOutgoingTxnsByUser,
  TxnAndProject,
} from '@/db/txn'
import { Bid, getBidsByUser } from '@/db/bid'
import { getProjectsByUser, Project } from '@/db/project'
import { ProfileTabs } from './profile-tabs'
import { calculateUserBalance } from '@/utils/math'

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
  const incomingTxns = await getIncomingTxnsByUser(supabase, profile.id)
  const outgoingTxns = await getOutgoingTxnsByUser(supabase, profile.id)
  const investments = await compileInvestments(incomingTxns, outgoingTxns)
  const balance = calculateUserBalance(incomingTxns, outgoingTxns)
  const withdrawBalance = calculateWithdrawBalance(
    investments,
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

async function compileInvestments(
  incomingTxns: TxnAndProject[],
  outgoingTxns: TxnAndProject[]
) {
  const incomingProjectTxns = incomingTxns.filter((txn) => txn.project !== null)
  const outgoingProjectTxns = outgoingTxns.filter((txn) => txn.project !== null)

  let investments: Investment[] = []
  incomingProjectTxns.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project?.id === item.project
    )
    if (item.token === 'USD') {
      if (aggInvestment) {
        aggInvestment.price_usd += item.amount
      } else {
        investments.push({
          project: item.projects,
          num_shares: 0,
          price_usd: item.amount,
        })
      }
    } else {
      if (aggInvestment) {
        aggInvestment.num_shares += item.amount
      } else {
        investments.push({
          project: item.projects,
          num_shares: item.amount,
          price_usd: 0,
        })
      }
    }
  })
  outgoingProjectTxns.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project?.id === item.project
    )
    if (item.token === 'USD') {
      if (aggInvestment) {
        aggInvestment.price_usd -= item.amount
      } else {
        investments.push({
          project: item.projects,
          num_shares: 0,
          price_usd: -item.amount,
        })
      }
    } else {
      if (aggInvestment) {
        aggInvestment.num_shares -= item.amount
      } else {
        investments.push({
          project: item.projects,
          num_shares: -item.amount,
          price_usd: 0,
        })
      }
    }
  })
  return investments as Investment[]
}

function calculateWithdrawBalance(
  investments: Investment[],
  bids: Bid[],
  userId: string,
  balance: number,
  accredited: boolean
) {
  let withdrawableAmount = accredited ? balance : 0
  if (!accredited) {
    investments.forEach((investment) => {
      if (investment.project?.creator === userId) {
        withdrawableAmount += investment.price_usd
      }
    })
  }
  let availableNonWithdrawAmount = balance - withdrawableAmount
  bids.forEach((bid) => {
    if (bid.status === 'pending' && bid.type === 'buy') {
      availableNonWithdrawAmount -= bid.amount
    }
  })
  if (availableNonWithdrawAmount < 0) {
    withdrawableAmount += availableNonWithdrawAmount
  }
  return withdrawableAmount > 0 ? withdrawableAmount : 0
}
