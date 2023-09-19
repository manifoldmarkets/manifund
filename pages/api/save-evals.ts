import { ConfidenceMap, Tier } from '@/app/evals/tier-list'
import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type EvalsProps = {
  tiers: Tier[]
  confidenceMap: ConfidenceMap
}
export default async function handler(req: NextRequest) {
  const { tiers, confidenceMap } = (await req.json()) as EvalsProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    return NextResponse.error()
  }
  const evalsToUpsert = tiers.flatMap((tier) => {
    if (tier.id === 'unsorted') {
      return []
    }
    return tier.projects.map((project) => {
      return {
        project_id: project.id,
        evaluator_id: user.id,
        score: parseInt(tier.id),
        confidence: confidenceMap[project.id],
      }
    })
  })
  const { error: error1 } = await supabase
    .from('project_evals')
    .upsert(evalsToUpsert, {
      onConflict: 'project_id, evaluator_id',
      ignoreDuplicates: true,
    })
    .select()
  if (error1) {
    console.error(error1)
    return NextResponse.error()
  }
  const projectIdsToDelete =
    tiers
      .find((tier) => tier.id === 'unsorted')
      ?.projects.map((project) => project.id) ?? []
  const { error: error2 } = await supabase
    .from('project_evals')
    .delete()
    .in('project_id', projectIdsToDelete)
    .throwOnError()
  if (error2) {
    console.error(error2)
    return NextResponse.error()
  }
  return NextResponse.json('success')
}
