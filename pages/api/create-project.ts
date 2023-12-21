import { Project, TOTAL_SHARES } from '@/db/project'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createAdminClient, createEdgeClient } from './_db'
import { projectSlugify, toTitleCase } from '@/utils/formatting'
import { ProjectParams } from '@/app/create/create-project-form'
import { getPrizeCause, updateProjectCauses } from '@/db/cause'
import { getProposalValuation, getMinIncludingAmm } from '@/utils/math'
import { seedAmm } from '@/utils/activate-project'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler(req: NextRequest) {
  const {
    title,
    subtitle,
    minFunding,
    fundingGoal,
    verdictDate,
    description,
    location,
    selectedCauses,
    selectedPrize,
    founderPercent,
    agreedToTerms,
  } = (await req.json()) as ProjectParams
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const causeSlugs = selectedCauses.map((cause) => cause.slug)
  if (!!selectedPrize) {
    causeSlugs.push(selectedPrize.slug)
  }
  const seedingAmm =
    selectedPrize?.cert_params?.ammShares &&
    (agreedToTerms || selectedPrize?.cert_params?.adjustableInvestmentStructure)
  const startingStage =
    selectedPrize && !selectedPrize.cert_params?.proposalPhase
      ? 'active'
      : 'proposal'
  const type = !!selectedPrize ? 'cert' : 'grant'
  const slug = await projectSlugify(title, supabase)
  const projectId = uuid()
  const project = {
    id: projectId,
    title,
    blurb: subtitle,
    description,
    min_funding: minFunding ?? 0,
    funding_goal: fundingGoal ?? minFunding ?? 0,
    founder_shares: !!selectedPrize
      ? (founderPercent / 100) * TOTAL_SHARES
      : TOTAL_SHARES,
    amm_shares: seedingAmm ? selectedPrize?.cert_params?.ammShares : null,
    creator: user.id,
    slug,
    round: !!selectedPrize ? toTitleCase(selectedPrize.title) : 'Regrants',
    auction_close: verdictDate,
    stage: startingStage,
    type: !!selectedPrize ? 'cert' : 'grant',
    location_description: location,
    approved: null,
    signed_agreement: false,
  } as Project
  await supabase.from('projects').insert(project).throwOnError()
  await upvoteOwnProject(supabase, projectId, user.id)
  await updateProjectCauses(supabase, causeSlugs, project.id)
  await giveCreatorShares(supabase, projectId, user.id)
  const prizeCause = await getPrizeCause(causeSlugs, supabase)
  if (type === 'cert' && prizeCause) {
    const certParams = prizeCause.cert_params
    if (certParams?.proposalPhase) {
      await addBid(
        supabase,
        projectId,
        user.id,
        getMinIncludingAmm(project),
        getProposalValuation(project),
        startingStage === 'proposal' ? 'assurance sell' : 'sell'
      )
    } else if (certParams?.ammDollars && project.amm_shares) {
      const supabaseAdmin = createAdminClient()
      await supabaseAdmin.from('txns').insert({
        from_id: process.env.NEXT_PUBLIC_PROD_BANK_ID,
        to_id: user.id,
        amount: certParams.ammDollars,
        token: 'USD',
        project: projectId,
        type: 'project donation',
      })
      await seedAmm(project, supabaseAdmin, certParams.ammDollars)
    }
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
    type: 'mint cert',
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
  valuation: number,
  type: string = 'sell'
) {
  const bid = {
    bidder: creatorId,
    amount,
    valuation,
    project: projectId,
    type: type,
  }
  const { error } = await supabase.from('bids').insert([bid])
  if (error) {
    console.error('create-project', error)
  }
}

async function upvoteOwnProject(
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
    console.error('create-project', error)
  }
}
