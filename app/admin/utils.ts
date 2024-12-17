import { Txn } from '@/db/txn'

export function userBalances(txns: Txn[]) {
  const balances = new Map<string, number>()
  txns.forEach((txn) => {
    if (txn.from_id) {
      const from = balances.get(txn.from_id) ?? 0
      balances.set(txn.from_id, from - txn.amount)
    }
    const to = balances.get(txn.to_id) ?? 0
    balances.set(txn.to_id, to + txn.amount)
  })
  return balances
}
