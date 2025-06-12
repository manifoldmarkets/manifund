import { Txn, TxnType } from '@/db/txn'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { Project } from '@/db/project'
import { calculateAMMPorfolio } from '@/utils/amm'
import uuid from 'react-uuid'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Used to add txn type column to txns table
export default async function handler() {
  const supabaseAdmin = createAdminClient()
  const projects = await getProjectsByRound(
    supabaseAdmin,
    'Manifold Community Fund'
  )
  if (!projects) {
    console.error('No projects found')
    return NextResponse.error()
  }
  for (const project of projects) {
    const [ammShares, ammUSD] = calculateAMMPorfolio(project.txns, project.id)
    const bundleId = uuid()
    const sharesTxn = {
      from_id: project.id,
      to_id: project.creator,
      project: project.id,
      amount: ammShares,
      type: 'inject amm liquidity' as TxnType,
      bundle: bundleId,
      token: project.id,
    }
    const usdTxn = {
      from_id: project.id,
      to_id: project.creator,
      project: project.id,
      amount: ammUSD,
      type: 'inject amm liquidity' as TxnType,
      bundle: bundleId,
      token: 'USD',
    }
    console.log('PROJECT:', project.title)
    console.log('amm assets:', ammShares, ammUSD)
    console.log('txns:', sharesTxn, usdTxn)
    console.log('=============================')
    await supabaseAdmin.from('txns').insert([sharesTxn, usdTxn])
    await supabaseAdmin
      .from('projects')
      .update({ amm_shares: 0, stage: 'complete' })
      .eq('id', project.id)
  }
  return NextResponse.json('success')
}

type ProjectAndTxns = Project & { txns: Txn[] }
async function getProjectsByRound(supabase: SupabaseClient, round: string) {
  const { data: projects } = await supabase
    .from('projects')
    .select('*, txns(*)')
    .eq('round', round)
  return projects as ProjectAndTxns[]
}
