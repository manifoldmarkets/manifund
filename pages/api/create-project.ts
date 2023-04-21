import { Database } from '@/db/database.types'
import { TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type ProjectInsert = Database['public']['Tables']['projects']['Insert']

export default async function handler(req: NextRequest) {
  const {
    title,
    blurb,
    description,
    min_funding,
    funding_goal,
    founder_portion,
    round,
    auction_close,
    stage,
    type,
  } = (await req.json()) as ProjectInsert
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  let slug = (title ?? '')
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
  if (data && data.length > 0) {
    slug = slug + '-' + Math.random().toString(36).substring(2, 15)
  }
  const id = uuid()
  const project = {
    id,
    title,
    blurb,
    description,
    min_funding,
    funding_goal,
    founder_portion,
    creator: user.id,
    slug,
    round,
    auction_close,
    stage,
    type,
  }
  const { error } = await supabase.from('projects').insert([project])
  if (error) {
    console.error('create-project', error)
  }
  await giveCreatorShares(supabase, id, user.id)
  if (stage === 'active' && type === 'cert') {
    await addBid(
      supabase,
      id,
      user.id,
      min_funding,
      (TOTAL_SHARES * min_funding) / (TOTAL_SHARES - founder_portion)
    )
  }
  return NextResponse.json(project)
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
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error('create-project', error)
  }
}

async function addBid(
  supabase: SupabaseClient,
  projectId: string,
  creatorId: string,
  amount: number,
  valuation: number
) {
  const bid = {
    bidder: creatorId,
    amount,
    valuation,
    project: projectId,
    type: 'sell',
  }
  const { error } = await supabase.from('bids').insert([bid])
  if (error) {
    console.error('create-project', error)
  }
}
