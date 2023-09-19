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
  // TODO: bulk upsert and delete
  for (const tier of tiers) {
    for (const project of tier.projects) {
      if (tier.id === 'unsorted') {
        await supabase
          .from('project_evals')
          .delete()
          .or(`project_id.eq.${project.id},evaluator_id.eq.${user.id}`)
          .throwOnError()
      } else {
        await supabase
          .from('project_evals')
          .upsert([
            {
              project_id: project.id,
              evaluator_id: user.id,
              score: parseInt(tier.id),
              confidence: confidenceMap[project.id],
            },
          ])
          .throwOnError()
      }
    }
  }
  return NextResponse.json('success')
}
