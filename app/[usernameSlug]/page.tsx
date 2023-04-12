import { getProfileByUsername, getUser, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { ProposalBids } from './user-proposal-bids'
import { ActiveBids } from './user-active-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import { getProjectTxnsByUser, TxnAndProject } from '@/db/txn'
import { Bid, getBidsByUser } from '@/db/bid'
import { getProjectsByUser, Project } from '@/db/project'
import { calculateUserBalance } from '@/utils/math'

export const revalidate = 0

export type investment = {
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
  const proposalBids = bids.filter(
    (bid) => bid.projects.stage === 'proposal' && bid.status === 'pending'
  )
  const activeBids = bids.filter(
    (bid) => bid.projects.stage === 'active' && bid.status === 'pending'
  )
  const isOwnProfile = user?.id === profile?.id
  const { incomingTxns, outgoingTxns } = await getProjectTxnsByUser(
    supabase,
    profile.id
  )
  const investments = await compileInvestments(incomingTxns, outgoingTxns)
  const notOwnProjectInvestments = investments.filter((investment) => {
    return investment.project && investment.project.creator !== profile.id
  })
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
        {proposalBids.length > 0 && (
          <ProposalBids bids={proposalBids} isOwnProfile={isOwnProfile} />
        )}
        {activeBids.length > 0 && (
          <ActiveBids bids={activeBids} isOwnProfile={isOwnProfile} />
        )}
        {notOwnProjectInvestments.length > 0 && (
          // @ts-expect-error Server Component
          <Investments
            investments={notOwnProjectInvestments}
            profile={profile.id}
          />
        )}
        {(isOwnProfile || projects.length > 0) && (
          // @ts-expect-error Server Component
          <Projects projects={projects} />
        )}

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
  const incomingProjectTxns = incomingTxns.filter((txn) => txn.project)
  const outgoingProjectTxns = outgoingTxns.filter((txn) => txn.project)
  let investments: investment[] = []
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
  return investments as investment[]
}

function calculateWithdrawBalance(
  investments: investment[],
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
