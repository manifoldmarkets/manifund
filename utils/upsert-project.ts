import { Cause, MiniCause } from '@/db/cause'
import { TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/supabase-js'
import { JSONContent } from '@tiptap/core'
import uuid from 'react-uuid'

export type ProjectParams = {
  title: string
  subtitle: string | null
  minFunding?: number
  fundingGoal?: number
  verdictDate: string
  description?: JSONContent | string
  location: string
  selectedCauses: MiniCause[]
  selectedPrize: Cause | null
  founderPercent: number
  agreedToTerms: boolean
  lobbying: boolean
  is_private: boolean
}

export async function giveCreatorShares(
  supabase: SupabaseClient,
  id: string,
  creator: string
) {
  const txn = {
    from_id: null,
    to_id: creator,
    amount: TOTAL_SHARES,
    token: id,
    project: id,
    type: 'mint cert',
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error(error)
  }
}

export async function upvoteOwnProject(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
) {
  const { error } = await supabase.from('project_votes').insert([
    {
      project_id: projectId,
      voter_id: userId,
      magnitude: 1,
    },
  ])
  if (error) {
    console.error(error)
  }
}

export function createUpdateFromParams(projectParams: ProjectParams) {
  const {
    title,
    subtitle,
    minFunding,
    fundingGoal,
    verdictDate,
    description,
    location,
    selectedPrize,
    founderPercent,
    lobbying,
  } = projectParams
  return {
    title,
    blurb: subtitle,
    description,
    min_funding: minFunding ?? 0,
    funding_goal: fundingGoal ?? minFunding ?? 0,
    founder_shares: !!selectedPrize
      ? (founderPercent / 100) * TOTAL_SHARES
      : TOTAL_SHARES,
    auction_close: verdictDate,
    location_description: location,
    lobbying,
  }
}
