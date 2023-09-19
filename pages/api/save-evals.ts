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
  console.log(1)
  const supabase = createEdgeClient(req)
  console.log(2)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  console.log(3)
  if (!user) {
    return NextResponse.error()
  }
  console.log(4)
  for (const tier of tiers) {
    console.log(5)
    if (tier.id === 'unsorted') {
      continue
    }
    for (const project of tier.projects) {
      console.log(6)
      console.log(
        project.id,
        project.title,
        user.id,
        tier.id,
        confidenceMap[project.id]
      )
      const { error } = await supabase.from('project_evals').upsert([
        {
          project_id: project.id,
          evaluator_id: user.id,
          score: parseInt(tier.id),
          confidence: confidenceMap[project.id],
        },
      ])
      if (error) {
        console.error(error)
        return NextResponse.error()
      }
    }
  }
  return NextResponse.json('success')
}
