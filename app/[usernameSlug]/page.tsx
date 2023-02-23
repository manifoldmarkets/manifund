import { getProfileByUsername, getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { Bids } from './user-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import { getIncomingTxnsByUser, getOutgoingTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { getProjectsByUser, Project } from '@/db/project'

export type investment = {
  project: Project
  num_shares: number
  price_usd: number
}

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = await getProfileByUsername(supabase, usernameSlug)
  const projects = await getProjectsByUser(supabase, profile.id)
  const bids = await getBidsByUser(supabase, profile.id)
  const proposalBids = bids.filter((bid) => bid.projects.stage == 'proposal')
  const isOwnProfile = user?.id === profile?.id
  const investments = await compileInvestments(supabase, profile.id)
  const notOwnProjectInvestments = investments.filter(
    (investment) => investment.project.creator != profile.id
  )
  const balance = calculateBalance(investments)
  return (
    <div className="flex flex-col gap-10 p-5">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        balance={balance}
      />

      {isOwnProfile && proposalBids.length > 0 && <Bids bids={bids} />}
      {notOwnProjectInvestments.length > 0 && (
        // @ts-expect-error Server Component
        <Investments
          supabase={supabase}
          investments={notOwnProjectInvestments}
          profile={profile.id}
        />
      )}
      {/* @ts-expect-error Server Component */}
      <Projects projects={projects} />
      {isOwnProfile && (
        <div className="mt-5 flex justify-center">
          <SignOutButton />
        </div>
      )}
    </div>
  )
}

async function compileInvestments(
  supabase: SupabaseClient,
  profile_id: string
) {
  const incomingTxns = await getIncomingTxnsByUser(supabase, profile_id)
  const outgoingTxns = await getOutgoingTxnsByUser(supabase, profile_id)
  let investments: investment[] = []
  incomingTxns.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project.id === item.project
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
  outgoingTxns.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project.id === item.project
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

function calculateBalance(investments: investment[]) {
  let balance = 0
  investments.forEach((investment) => {
    balance += investment.price_usd
  })
  return balance
}
