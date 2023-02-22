import { getProfileByUsername, getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { ProfileHeader } from './profile-header'
import { SignOutButton } from './sign-out-button'
import { Bids } from './user-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import {
  getIncomingSharesByUser,
  getOutgoingSharesByUser,
  getIncomingPaymentsByUser,
  getOutgoingPaymentsByUser,
} from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { getProjectsByUser } from '@/db/project'

type Txn = Database['public']['Tables']['txns']['Row']
export type investment = {
  project_id: string
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
  const balance = calculateBalance(investments)
  return (
    <div className="flex flex-col gap-10 p-5">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        balance={balance}
      />

      {isOwnProfile && proposalBids.length > 0 && (
        // @ts-expect-error Server Component
        <Bids bids={bids} supabase={supabase} />
      )}
      {isOwnProfile && investments.length > 0 && (
        // @ts-expect-error Server Component
        <Investments
          supabase={supabase}
          investments={investments}
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
  const incomingShares: Txn[] = await getIncomingSharesByUser(
    supabase,
    profile_id
  )
  const outgoingShares: Txn[] = await getOutgoingSharesByUser(
    supabase,
    profile_id
  )
  const incomingPayments: Txn[] = await getIncomingPaymentsByUser(
    supabase,
    profile_id
  )
  const outgoingPayments: Txn[] = await getOutgoingPaymentsByUser(
    supabase,
    profile_id
  )
  let investments: investment[] = []
  incomingShares.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project_id === item.token
    )
    if (aggInvestment) {
      aggInvestment.num_shares += item.amount
    } else {
      investments.push({
        project_id: item.token,
        num_shares: item.amount,
        price_usd: 0,
      })
    }
  })
  outgoingShares.forEach((item) => {
    let aggInvestment = investments.find(
      (investment) => investment.project_id === item.token
    )
    if (aggInvestment) {
      aggInvestment.num_shares -= item.amount
    } else {
      investments.push({
        project_id: item.token,
        num_shares: -item.amount,
        price_usd: 0,
      })
    }
  })
  incomingPayments.forEach((item) => {
    if (item.from_id) {
      let aggInvestment = investments.find(
        (investment) => investment.project_id === item.project
      )
      if (aggInvestment) {
        aggInvestment.price_usd += item.amount
      } else {
        investments.push({
          project_id: item.from_id,
          num_shares: 0,
          price_usd: item.amount,
        })
      }
    }
  })
  outgoingPayments.forEach((item) => {
    if (item.to_id) {
      let aggInvestment = investments.find(
        (investment) => investment.project_id === item.project
      )
      if (aggInvestment) {
        aggInvestment.price_usd -= item.amount
      } else {
        investments.push({
          project_id: item.to_id,
          num_shares: 0,
          price_usd: -item.amount,
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
