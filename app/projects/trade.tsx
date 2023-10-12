'use client'

import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'

export function Trade(props: { ammTxns: Txn[]; ammId: string }) {
  const { ammTxns, ammId } = props
  return (
    <div>
      <h1>Trade</h1>
      <div>price: {calculatePrice(ammTxns, ammId)}</div>
    </div>
  )
}

function calculatePrice(ammTxns: Txn[], ammId: string) {
  const ammShares = ammTxns.reduce((total, txn) => {
    if (txn.token !== 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  const ammUSD = ammTxns.reduce((total, txn) => {
    if (txn.token === 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  return (ammUSD / ammShares) * TOTAL_SHARES
}
