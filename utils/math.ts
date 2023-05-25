import { Bid, getBidsByUser } from '@/db/bid'
import { Profile } from '@/db/profile'
import {
  getProjectTransfersByUser,
  Project,
  ProjectTransfer,
} from '@/db/project'
import { TOTAL_SHARES } from '@/db/project'
import { getFullTxnsByUser, Txn, TxnAndProfiles } from '@/db/txn'
import { SupabaseClient } from '@supabase/supabase-js'
import { orderBy } from 'lodash'

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
export function getActiveValuation(
  txns: Txn[],
  bids: Bid[],
  minValuation: number
) {
  const tradeTxns = txns.filter((txn) => txn.bundle !== null)
  if (tradeTxns.length === 0) {
    if (bids.length === 0) {
      return minValuation
    } else {
      return bids[bids.length - 1].valuation
    }
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

export function calculateUserBalance(txns: Txn[], userId: string) {
  let balance = 0
  txns.forEach((txn) => {
    const incoming = txn.to_id === userId
    if (txn.token === 'USD') {
      balance += incoming ? txn.amount : -txn.amount
    }
  })
  return balance
}

export function getPercentRaised(bids: Bid[], project: Project) {
  const total = bids.reduce((acc, bid) => acc + bid.amount, 0)
  return (total / project.funding_goal) * 100
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
      trade.toProfile = txn.profiles
      trade.bundle = txn.bundle
    } else {
      trade.numShares = txn.amount
      trade.fromProfile = txn.profiles
    }
  }
  return orderBy(Object.values(trades), 'date', 'desc') as FullTrade[]
}

export function dateDiff(first: number, second: number) {
  return Math.round(second - first) / (1000 * 60 * 60 * 24)
}

export function calculateUserSpendableFunds(
  txns: Txn[],
  userId: string,
  bids: Bid[],
  projectTransfers: ProjectTransfer[],
  accreditation_status: boolean,
  balance?: number
) {
  const currentBalance = balance ?? calculateUserBalance(txns, userId)
  if (accreditation_status) {
    return currentBalance
  }
  const lockedFunds =
    bids
      .filter((bid) => bid.status === 'pending' && bid.type === 'buy')
      .reduce((acc, bid) => acc + bid.amount, 0) +
    projectTransfers
      .filter((transfer) => !transfer.transferred)
      .reduce((acc, transfer) => acc + (transfer.grant_amount ?? 0), 0)
  return currentBalance - lockedFunds
}

export async function calculateUserFundsAndShares(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  accreditation_status: boolean
) {
  if (!userId) {
    return { userSpendableFunds: 0, userSellableShares: 0, userShares: 0 }
  }
  const txns = await getFullTxnsByUser(supabase, userId)
  const projectTransfers = await getProjectTransfersByUser(supabase, userId)
  const userBids = await getBidsByUser(supabase, userId)
  const calculateUserShares = () => {
    let userShares = 0
    txns.forEach((txn) => {
      const incoming = txn.to_id === userId
      if (txn.token === projectId) {
        userShares += incoming ? txn.amount : -txn.amount
      }
    })
    return userShares
  }
  const userShares = calculateUserShares()
  const offeredShares = userBids
    .filter(
      (bid) =>
        bid.type === 'sell' &&
        bid.status === 'pending' &&
        bid.project === projectId
    )
    .reduce((acc, bid) => acc + bid.amount, 0)
  const userSellableShares = userShares - offeredShares
  const userSpendableFunds = calculateUserSpendableFunds(
    txns,
    userId,
    userBids,
    projectTransfers,
    accreditation_status
  )
  return { userSpendableFunds, userSellableShares, userShares }
}
