import { isBefore } from 'date-fns'
import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  const supabase = createAdminClient()
  const { data: proposals } = await supabase
    .from('projects')
    .select('*, bids(*)')
    .eq('stage', 'proposal')
  const proposalsPastDeadline = proposals?.filter((proposal) => {
    return isBefore(new Date(proposal.auction_close ?? ''), new Date())
  })
  proposalsPastDeadline?.forEach(async (proposal) => {
    await closeGrant(proposal, proposal.bids, supabase)
  })
}

async function closeGrant(
  project: Project,
  bids: Bid[],
  supabase: SupabaseClient
) {
  // if proposal has enough money, send notif to us or user depending on bottleneck
  // if proposal doesn't have enough money:
  // bids declined, project "not funded", notif to creator & bidders

  const amountRaised = getAmountRaised(project, bids)
  if (amountRaised >= project.min_funding) {
    if (!project.signed_agreement) {
      // Send reminder email to creator
    }
    if (!project.approved) {
      // Send reminder email to admins
    }
  } else {
    await supabase
      .rpc('reject_grant', {
        project_id: project.id,
      })
      .throwOnError()
    // Grant verdict email to creator
    // Bid resolution email to bidders
  }
}
