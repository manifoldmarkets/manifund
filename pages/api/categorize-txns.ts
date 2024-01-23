import { Txn } from '@/db/txn'
import { bundleTxns } from '@/utils/math'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

// Used to add txn type column to txns table
export default async function handler() {
  const supabaseAdmin = createAdminClient()
  const { data: txns } = await supabaseAdmin.from('txns').select('*')
  await dbCategorizeTxns(txns ?? [], supabaseAdmin)
  return NextResponse.json('success')
}

async function dbCategorizeTxns(txns: Txn[], supabase: SupabaseClient) {
  const bundledTxns = bundleTxns(txns)
  const categorizedTxns = Object.fromEntries(
    txns.map((txn) => [txn.id, null as string | null])
  )
  bundledTxns.forEach((bundle) => {
    if (bundle.length === 1) {
      const txn = bundle[0]
      if (!!txn.project) {
        if (txn.token === 'USD') {
          categorizedTxns[txn.id] = 'project donation'
        } else {
          categorizedTxns[txn.id] = 'mint cert'
        }
      } else {
        if (txn.from_id === txn.to_id) {
          categorizedTxns[txn.id] = 'cash to charity transfer'
        } else {
          if (txn.from_id === process.env.NEXT_PUBLIC_PROD_BANK_ID) {
            categorizedTxns[txn.id] = 'deposit'
          } else if (txn.to_id === process.env.NEXT_PUBLIC_PROD_BANK_ID) {
            categorizedTxns[txn.id] = 'withdraw'
          } else {
            categorizedTxns[txn.id] = 'profile donation'
          }
        }
      }
    } else {
      const usdTxn = bundle[0]
      const sharesTxn = bundle[1]
      if (
        usdTxn.to_id === sharesTxn.to_id &&
        usdTxn.from_id === sharesTxn.from_id &&
        usdTxn.to_id === usdTxn.project
      ) {
        categorizedTxns[usdTxn.id] = 'inject amm liquidity'
        categorizedTxns[sharesTxn.id] = 'inject amm liquidity'
      } else if (
        usdTxn.from_id === sharesTxn.to_id &&
        usdTxn.to_id === sharesTxn.from_id &&
        (usdTxn.from_id === usdTxn.project || usdTxn.to_id === usdTxn.project)
      ) {
        categorizedTxns[usdTxn.id] = 'user to amm trade'
        categorizedTxns[sharesTxn.id] = 'user to amm trade'
      } else {
        categorizedTxns[usdTxn.id] = 'user to user trade'
        categorizedTxns[sharesTxn.id] = 'user to user trade'
      }
    }
  })

  const promises = txns.map(async (txn) => {
    await supabase
      .from('txns')
      .update({ type: categorizedTxns[txn.id] })
      .eq('id', txn.id)
  })
  await Promise.all(promises)
}
