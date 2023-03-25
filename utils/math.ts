import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { TOTAL_SHARES } from '@/db/project'
import { Txn, TxnAndProfiles } from '@/db/txn'
import { orderBy } from 'lodash'
import { formatLargeNumber } from './formatting'

export function getProposalValuation(project: Project) {
  const investorPercent =
    (TOTAL_SHARES - project.founder_portion) / TOTAL_SHARES
  return project.min_funding / investorPercent
}

type MathTrade = {
  amountUSD: number
  numShares: number
  date: Date
  bundle: string
}
export function getActiveValuation(txns: Txn[], minValuation: number) {
  const tradeTxns = txns.filter((txn) => txn.bundle !== null)
  if (tradeTxns.length === 0) {
    return minValuation
  }
  const trades = Object.fromEntries(
    tradeTxns.map((txn) => [txn.bundle, {} as MathTrade])
  )
  for (const txn of tradeTxns) {
    const trade = trades[txn?.bundle ?? 0]
    if (txn.token === 'USD') {
      trade.amountUSD = txn.amount
      trade.date = new Date(txn.created_at)
      trade.bundle = txn.bundle
    } else {
      trade.numShares = txn.amount
    }
  }
  const sortedTrades = orderBy(
    Object.values(trades),
    'date',
    'desc'
  ) as MathTrade[]
  return (sortedTrades[0].amountUSD / sortedTrades[0].numShares) * TOTAL_SHARES
}

export function calculateUserBalance(incomingTxns: Txn[], outgoingTxns: Txn[]) {
  let incoming = 0
  let outgoing = 0
  if (incomingTxns) {
    incomingTxns.forEach((txn) => {
      if (txn.token == 'USD') {
        incoming += txn.amount
      }
    })
  }
  if (outgoingTxns) {
    outgoingTxns.forEach((txn) => {
      if (txn.token == 'USD') {
        outgoing += txn.amount
      }
    })
  }
  return incoming - outgoing
}

export function getPercentFunded(bids: Bid[], minFunding: number) {
  const total = bids.reduce((acc, bid) => acc + bid.amount, 0)
  return (total / minFunding) * 100
}

export type FullTrade = {
  bundle: string
  toProfile: Profile
  fromProfile: Profile
  amountUSD: number
  numShares: number
  date: Date
}
export function calculateFullTrades(txns: TxnAndProfiles[]) {
  const tradeTxns = txns.filter((txn) => txn.bundle !== null)
  const trades = Object.fromEntries(
    tradeTxns.map((txn) => [txn.bundle, {} as FullTrade])
  )
  for (const txn of tradeTxns) {
    const trade = trades[txn?.bundle ?? 0]
    if (txn.token === 'USD') {
      trade.amountUSD = txn.amount
      trade.date = new Date(txn.created_at)
      trade.fromProfile = txn.profiles
      trade.bundle = txn.bundle
    } else {
      trade.numShares = txn.amount
      trade.toProfile = txn.profiles
    }
  }
  return orderBy(Object.values(trades), 'date', 'desc') as FullTrade[]
}

export function dateDiff(first: number, second: number) {
  return Math.round(second - first) / (1000 * 60 * 60 * 24)
}
