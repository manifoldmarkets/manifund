import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { ConfidenceMap, TierObj, TrustObj } from '@/app/evals-form/evals-form'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type EvalsProps = {
  tiers: TierObj[]
  confidenceMap: ConfidenceMap
  trustList: TrustObj[]
}
export default async function handler(req: NextRequest) {
  const { tiers, confidenceMap, trustList } = (await req.json()) as EvalsProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) {
    return NextResponse.error()
  }
  const evalsToUpsert = tiers
    .filter((tier) => tier.id !== 'unsorted')
    .flatMap((tier) => {
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
      ignoreDuplicates: false,
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
  const trustToUpsert = trustList
    .filter((trust) => trust.profileId !== null)
    .map((trust) => {
      return {
        truster_id: user.id,
        trusted_id: trust.profileId as string,
        weight: trust.trust,
      }
    })
  const { error: error3 } = await supabase
    .from('profile_trust')
    .upsert(trustToUpsert, {
      onConflict: 'trusted_id, truster_id',
      ignoreDuplicates: false,
    })
    .select()
  if (error3) {
    console.error(error3)
    return NextResponse.error()
  }
  const { error: error4 } = await supabase
    .from('profile_trust')
    .delete()
    .not(
      'trusted_id',
      'in',
      `(${trustList.map((trust) => trust.profileId).toString()})`
    )
    .eq('truster_id', user.id)
  if (error4) {
    console.error(error4)
    return NextResponse.error()
  }
  return NextResponse.json('success')
}
