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

  return (
    <div className="flex flex-col p-5">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <div className="flex flex-col gap-10">
        <ProfileTabs
          isOwnProfile={isOwnProfile}
          profile={profile}
          projects={projects}
          bids={bids}
          investments={investments}
          txns={txns}
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
