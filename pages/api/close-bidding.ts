import { Database } from '@/db/database.types'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type Bid = Database['public']['Tables']['bids']['Row']

type ProjectProps = {
  id: string
  min_funding: number
  founder_portion: number
  creator: string
}

export default async function handler(req: NextRequest) {
  const { id, min_funding, founder_portion, creator } =
    (await req.json()) as ProjectProps
  const supabase = createEdgeClient(req)
  const bids = await getBids(supabase, id)
  if (!bids) return NextResponse.error()
  let i = 0
  let total_funding = 0
  let investor_shares = 10000000 - founder_portion
  let project_funded = false
  while (i < bids.length && !project_funded) {
    let valuation = bids[i].valuation
    total_funding += bids[i].amount
    let unbought_shares =
      investor_shares - (total_funding * 10000000) / valuation
    if (unbought_shares <= 0) {
      addTxns(
        supabase,
        id,
        bids,
        i,
        (bids[i].amount * 10000000) / valuation + unbought_shares,
        creator
      )
      updateBidsStatus(supabase, bids, i, id)
      project_funded = true
    } else if (i == bids.length - 1 && total_funding >= min_funding) {
      addTxns(supabase, id, bids, i, bids[i].amount, creator)
      updateBidsStatus(supabase, bids, i, id)
      project_funded = true
    }
    i++
  }

  if (!project_funded) {
    updateProjectStage(supabase, id, 'not funded')
    updateBidsStatus(supabase, bids, bids.length, id)
    return NextResponse.json('project not funded')
  }
  updateProjectStage(supabase, id, 'active')
  return NextResponse.json('project funded!')
}

async function getBids(supabase: SupabaseClient, project_id: string) {
  const { data, error } = await supabase
    .from('bids')
    .select()
    .eq('project', project_id)
    .eq('status', 'pending')
    .order('valuation', { ascending: false })
  if (error) {
    console.error('getBids', error)
  }
  return data
}

async function addTxns(
  supabase: SupabaseClient,
  project_id: string,
  bids: Bid[],
  last_bid_idx: number,
  last_bid_amount: number,
  creator: string
) {
  //create txn for each bid that goes through
  let valuation = bids[last_bid_idx].valuation
  for (let i = 0; i < last_bid_idx + 1; i++) {
    let shares_amount =
      i == last_bid_idx
        ? Math.round(last_bid_amount)
        : Math.round((bids[i].amount * 10000000) / valuation)
    let dollar_amount = Math.round((shares_amount * valuation) / 10000000)
    addTxn(
      supabase,
      creator,
      bids[i].bidder,
      shares_amount,
      project_id,
      project_id
    )
    addTxn(supabase, bids[i].bidder, creator, dollar_amount, 'USD', project_id)
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
  bids: Bid[],
  lastBidIdx: number,
  project_id: string
) {
  const { error } = await supabase
    .from('bids')
    .update({ status: 'declined' })
    .eq('project', project_id)
    .eq('status', 'pending')
  if (error) {
    console.error('updateBidStatus', error)
  }
  for (let i = 0; i < lastBidIdx + 1; i++) {
    const { error } = await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', bids[i].id)
    if (error) {
      console.error('updateBidStatus', error)
    }
  }
}
