import { Project, TOTAL_SHARES } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createAdminClient, createEdgeClient } from '@/db/edge'
import { projectSlugify, toTitleCase } from '@/utils/formatting'
import { ProjectParams } from '@/utils/upsert-project'
import { getPrizeCause, updateProjectCauses } from '@/db/cause'
import { getProposalValuation, getMinIncludingAmm } from '@/utils/math'
import { insertBid } from '@/db/bid'
import { invalidateProjectsCache } from '@/db/project-cached'
import { seedAmm } from '@/utils/activate-project'
import { upvoteOwnProject, giveCreatorShares } from '@/utils/upsert-project'
import { updateProjectEmbedding } from '@/app/utils/embeddings'
import { DISABLE_NEW_SIGNUPS_AND_PROJECTS, SIGNUP_DISABLED_MESSAGE } from '@/utils/constants'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler(req: NextRequest) {
  if (DISABLE_NEW_SIGNUPS_AND_PROJECTS) {
    return NextResponse.json({ error: SIGNUP_DISABLED_MESSAGE }, { status: 503 })
  }

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
  } = (await req.json()) as ProjectParams
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  // Check for existing project with same title by this user (prevents duplicates from double-submit)
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('creator', user.id)
    .eq('title', title)
    .limit(1)

  if (existingProjects && existingProjects.length > 0) {
    // Return existing project instead of creating duplicate
    return NextResponse.json(existingProjects[0])
  }

  const slug = await projectSlugify(title, supabase)
  const projectId = uuid()
  const defaultProject = {
    id: projectId,
    title,
    blurb: subtitle,
    description,
    min_funding: minFunding ?? 500,
    funding_goal: fundingGoal ?? minFunding ?? 0,
    founder_shares: TOTAL_SHARES,
    amm_shares: null,
    creator: user.id,
    slug,
    round: 'Regrants',
    auction_close: verdictDate,
    stage: 'proposal',
    type: 'grant',
    location_description: location,
    approved: null,
    signed_agreement: false,
    lobbying,
  } as Project

  const causeSlugs = selectedCauses.map((cause) => cause.slug)
  if (!!selectedPrize) {
    causeSlugs.push(selectedPrize.slug)
  }

  let project = defaultProject
  if (selectedPrize?.slug === 'ea-community-choice') {
    project = {
      ...defaultProject,
      round: 'EA Community Choice',
    }
  } else if (selectedPrize) {
    const seedingAmm =
      selectedPrize?.cert_params?.ammShares &&
      (agreedToTerms || selectedPrize?.cert_params?.adjustableInvestmentStructure)
    project = {
      ...defaultProject,
      founder_shares: (founderPercent / 100) * TOTAL_SHARES,
      amm_shares: seedingAmm ? (selectedPrize.cert_params?.ammShares ?? null) : null,
      round: toTitleCase(selectedPrize.title),
      stage: selectedPrize.cert_params?.proposalPhase ? 'proposal' : 'active',
      type: 'cert',
    }
  }

  await supabase.from('projects').insert(project).throwOnError()
  await upvoteOwnProject(supabase, projectId, user.id)
  await updateProjectCauses(supabase, causeSlugs, project.id)
  await giveCreatorShares(supabase, projectId, user.id)
  const prizeCause = await getPrizeCause(causeSlugs, supabase)
  if (project.type === 'cert' && prizeCause) {
    const certParams = prizeCause.cert_params
    if (certParams?.proposalPhase) {
      await insertBid(supabase, {
        project: projectId,
        bidder: user.id,
        amount: getMinIncludingAmm(project),
        valuation: getProposalValuation(project),
        type: project.stage === 'proposal' ? 'assurance sell' : 'sell',
      })
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

  invalidateProjectsCache()
  updateProjectEmbedding(projectId).catch((error) => {
    console.error('Failed to generate embeddings for new project:', error)
  })

  return NextResponse.json(project)
}
