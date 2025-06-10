import { updateProject, getProjectById } from '@/db/project'
import { invalidateProjectsCache } from '@/db/project-cached'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { createUpdateFromParams, ProjectParams } from '@/utils/upsert-project'
import { getPrizeCause } from '@/db/cause'
import { getProposalValuation, getMinIncludingAmm } from '@/utils/math'
import { seedAmm } from '@/utils/activate-project'
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
  const { projectParams, projectId } = (await req.json()) as {
    projectParams: ProjectParams
    projectId: string
  }
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const causeSlugs = projectParams.selectedCauses.map((cause) => cause.slug)
  const selectedPrize = projectParams.selectedPrize
  const startingStage =
    selectedPrize && !selectedPrize.cert_params?.proposalPhase
      ? 'active'
      : 'proposal'
  const type = !!selectedPrize ? 'cert' : 'grant'
  const projectUpdate = createUpdateFromParams(projectParams)
  await updateProject(supabase, projectId, {
    ...projectUpdate,
    stage: startingStage,
  })
  const updatedProject = await getProjectById(supabase, projectId)
  const prizeCause = await getPrizeCause(causeSlugs, supabase)
  if (type === 'cert' && prizeCause) {
    const certParams = prizeCause.cert_params
    if (certParams?.proposalPhase) {
      await insertBid(supabase, {
        project: projectId,
        bidder: user.id,
        amount: getMinIncludingAmm(updatedProject),
        valuation: getProposalValuation(updatedProject),
        type: startingStage === 'proposal' ? 'assurance sell' : 'sell',
      })
    } else if (certParams?.ammDollars && updatedProject.amm_shares) {
      const supabaseAdmin = createAdminClient()
      const { error } = await supabaseAdmin.from('txns').insert({
        from_id: process.env.NEXT_PUBLIC_PROD_BANK_ID,
        to_id: user.id,
        amount: certParams.ammDollars,
        token: 'USD',
        project: projectId,
        type: 'project donation',
      })
      if (error) {
        console.error(error)
        throw error
      }
      await seedAmm(updatedProject, supabaseAdmin, certParams.ammDollars)
    }
  }

  invalidateProjectsCache()

  return NextResponse.json('success')
}
