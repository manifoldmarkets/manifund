import { Database } from '@/db/database.types'
import { Project, TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type ProjectProps = {
  title: string
  blurb: string
  description: any
  min_funding: number
  funding_goal: number
  founder_portion: number
  round: string
  auction_close: string
  stage: string
  type: Project['type']
}

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
  } = (await req.json()) as ProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  let slug = title
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
  if (stage === 'active' && founder_portion < TOTAL_SHARES) {
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
    amount: 10000000,
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
