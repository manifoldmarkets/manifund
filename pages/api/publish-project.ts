import { Project, updateProject, TOTAL_SHARES } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { ProjectParams } from '@/app/create/create-project-form'
import { getPrizeCause, updateProjectCauses } from '@/db/cause'
import { getProposalValuation, getMinIncludingAmm } from '@/utils/math'
import { seedAmm } from '@/utils/activate-project'
import { upvoteOwnProject, giveCreatorShares } from '@/utils/upsert-project'
import { insertBid } from '@/db/bid'

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
    lobbying,
    id,
  } = (await req.json()) as ProjectParams & { id: string }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const causeSlugs = selectedCauses.map((cause) => cause.slug)
  const seedingAmm =
    selectedPrize?.cert_params?.ammShares &&
    (agreedToTerms || selectedPrize?.cert_params?.adjustableInvestmentStructure)
  const startingStage =
    selectedPrize && !selectedPrize.cert_params?.proposalPhase
      ? 'active'
      : 'proposal'
  const type = !!selectedPrize ? 'cert' : 'grant'
  const projectUpdate = {
    title,
    blurb: subtitle,
    description,
    min_funding: minFunding ?? 0,
    funding_goal: fundingGoal ?? minFunding ?? 0,
    founder_shares: !!selectedPrize
      ? (founderPercent / 100) * TOTAL_SHARES
      : TOTAL_SHARES,
    amm_shares: seedingAmm ? selectedPrize?.cert_params?.ammShares : null,
    auction_close: verdictDate,
    stage: startingStage,
    location_description: location,
    lobbying,
  } as Project
  await updateProject(supabase, id, projectUpdate)
  await upvoteOwnProject(supabase, id, user.id)
  await updateProjectCauses(supabase, causeSlugs, id)
  await giveCreatorShares(supabase, id, user.id)
  const prizeCause = await getPrizeCause(causeSlugs, supabase)
  if (type === 'cert' && prizeCause) {
    const certParams = prizeCause.cert_params
    if (certParams?.proposalPhase) {
      await insertBid(supabase, {
        project: id,
        bidder: user.id,
        amount: getMinIncludingAmm(projectUpdate),
        valuation: getProposalValuation(projectUpdate),
        type: startingStage === 'proposal' ? 'assurance sell' : 'sell',
      })
    } else if (certParams?.ammDollars && projectUpdate.amm_shares) {
      const supabaseAdmin = createAdminClient()
      const { error } = await supabaseAdmin.from('txns').insert({
        from_id: process.env.NEXT_PUBLIC_PROD_BANK_ID,
        to_id: user.id,
        amount: certParams.ammDollars,
        token: 'USD',
        project: id,
        type: 'project donation',
      })
      if (error) {
        console.error(error)
        throw error
      }
      await seedAmm(projectUpdate, supabaseAdmin, certParams.ammDollars)
    }
  }
  return NextResponse.json('success')
}
