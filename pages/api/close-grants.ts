import { isBefore } from 'date-fns'
import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'

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
}

function closeGrant(project: Project, bids: Bid[]) {
  // if proposal has enough money, send notif to us or user depending on bottleneck
  // if proposal doesn't have enough money:
  // bids declined, project "not funded", notif to creator & bidders

  const amountRaised = getAmountRaised(project, bids)
  if (amountRaised >= project.min_funding) {
  } else {
  }
}
