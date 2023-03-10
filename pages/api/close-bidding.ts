import { Database } from '@/db/database.types'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './_db'
import { TOTAL_SHARES } from '@/db/project'

import sortBy from 'lodash/sortBy'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // use a glob to allow anything in the function-bind 3rd party module
  ],
}

type Bid = Database['public']['Tables']['bids']['Row']

type ProjectProps = {
  id: string
  minFunding: number
  founderShares: number
  creator: string
}

export type MutableBid = {
  createdAt: number
  amount: number
  valuation: number
  amountPaid: number
}

export default async function handler(req: NextRequest) {
  const { id, minFunding, founderShares, creator } =
    (await req.json()) as ProjectProps
  const supabase = createAdminClient()
  const bids = await getBids(supabase, id)
  if (!bids) return NextResponse.json('project not funded')

  const mutableBids = bids.map((bid) => {
    return {
      createdAt: bid.created_at.getTime(),
      amount: bid.amount,
      valuation: bid.valuation,
      amountPaid: -1,
      id: bid.id,
    } as MutableBid
  })
  let founderPortion = founderShares / TOTAL_SHARES
  const resolution = resolveBids(mutableBids, minFunding, founderPortion)

  if (resolution.resolvedValuation === -1) {
    updateProjectStage(supabase, id, 'not funded')
    updateBidsStatus(supabase, mutableBids, bids)
    return NextResponse.json('project not funded')
  } else {
    updateProjectStage(supabase, id, 'active')
    addTxns(
      supabase,
      id,
      mutableBids,
      bids,
      resolution.resolvedValuation,
      creator
    )
    updateBidsStatus(supabase, mutableBids, bids)
    return NextResponse.json('project funded!')
  }
}

async function getBids(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('bids')
    .select()
    .eq('project', projectId)
    .eq('status', 'pending')
    .order('valuation', { ascending: false })
  if (error) {
    console.error('getBids', error)
  }
  return data
}

async function addTxns(
  supabase: SupabaseClient,
  projectId: string,
  mutableBids: MutableBid[],
  bids: Bid[],
  valuation: number,
  creator: string
) {
  //create txn for each bid that goes through
  for (let i = 0; i < bids.length + 1; i++) {
    if (mutableBids[i].amountPaid > 0) {
      let numShares = (mutableBids[i].amountPaid / valuation) * TOTAL_SHARES
      addTxn(supabase, creator, bids[i].bidder, numShares, projectId, projectId)
      addTxn(
        supabase,
        bids[i].bidder,
        creator,
        mutableBids[i].amountPaid,
        'USD',
        projectId
      )
    }
  }
}

async function addTxn(
  supabase: SupabaseClient,
  from_id: string,
  to_id: string,
  amount: number,
  token: string,
  project: string
) {
  let txn = {
    from_id,
    to_id,
    amount,
    token,
    project,
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error('createTxn', error)
  }
}

async function updateProjectStage(
  supabase: SupabaseClient,
  id: string,
  stage: string
) {
  const { error } = await supabase
    .from('projects')
    .update({ stage: stage })
    .eq('id', id)
  if (error) {
    console.error('updateProjectStage', error)
  }
}

async function updateBidsStatus(
  supabase: SupabaseClient,
  mutableBids: MutableBid[],
  bids: Bid[]
) {
  for (let i = 0; i < bids.length + 1; i++) {
    const { error } = await supabase
      .from('bids')
      .update({
        status: mutableBids[i].amountPaid > 0 ? 'accepted' : 'declined',
      })
      .eq('id', bids[i].id)
    if (error) {
      console.error('updateBidStatus', error)
    }
  }
}

export function resolveBids(
  sortedBids: MutableBid[],
  minFunding: number,
  founderPortion: number
) {
  console.log('sorted bids', sortedBids)
  let i = 0
  let totalFunding = 0
  // Starting at the bid w/ highest valuation, for each bid...
  while (i < sortedBids.length) {
    // Determine, at valuation of current bid, how much of the project is still unsold
    const valuation = sortedBids[i].valuation
    totalFunding += sortedBids[i].amount
    const unsoldPortion = 1 - founderPortion - totalFunding / valuation
    console.log('unsold portion', unsoldPortion, valuation, i)
    // If all shares are sold, bids go through
    if (unsoldPortion <= 0) {
      // Current bid gets partially paid out
      sortedBids[i].amountPaid =
        sortedBids[i].amount + unsoldPortion * valuation
      // Early return resolution data
      return {
        bids: sortBy(sortedBids, 'createdAt'),
        resolvedValuation: valuation,
      }
      // If all bids are exhausted but the project has enough funding, bids go through
    } else if (totalFunding >= minFunding && i + 1 == sortedBids.length) {
      // Current bid gets fully paid out
      sortedBids[i].amountPaid = sortedBids[i].amount
      // Early return resolution data
      return {
        bids: sortBy(sortedBids, 'createdAt'),
        resolvedValuation: valuation,
      }
    }
    // Haven't resolved yet; if project gets funded based on later bids, current bid will fully pay out
    sortedBids[i].amountPaid = sortedBids[i].amount
    i++
  }
  // Bids are exhausted and minimum funding was not reached: reject all bids & return resolution data
  return { bids: sortedBids, resolvedValuation: -1 }
}
