import { TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { projectSlugify } from '@/utils/formatting'
import { Database, Json } from '@/db/database.types'
import { updateProjectCauses } from '@/db/cause'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type CreateProjectProps = {
  title: string
  blurb: string
  description: Json
  min_funding: number
  funding_goal: number
  founder_portion: number
  round: string
  auction_close: string
  stage: Database['public']['Tables']['projects']['Row']['stage']
  type: Database['public']['Tables']['projects']['Row']['type']
  causeSlugs: string[]
  location_description: string
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
    causeSlugs,
    location_description,
  } = (await req.json()) as CreateProjectProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  const slug = await projectSlugify(title ?? '', supabase)
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
    location_description,
    approved: null,
    signed_agreement: false,
  }
  await supabase.from('projects').insert(project).throwOnError()
  await updateProjectCauses(supabase, causeSlugs, project.id)
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
