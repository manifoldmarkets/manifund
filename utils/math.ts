import { Bid, getBidsByUser } from '@/db/bid'
import { BANK_ID } from '@/db/env'
import { Profile } from '@/db/profile'
import { getProjectsPendingTransferByUser, Project } from '@/db/project'
import { TOTAL_SHARES } from '@/db/project'
import { FullTxn, getFullTxnsByUser, Txn, TxnAndProfiles } from '@/db/txn'
import { SupabaseClient } from '@supabase/supabase-js'
import { orderBy, sortBy } from 'lodash'

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
  projectsPendingTransfer: Project[],
  balance?: number
) {
  const currentBalance = balance ?? calculateUserBalance(txns, userId)
  const lockedFunds = calculateUserLockedFunds(bids, projectsPendingTransfer)
  return currentBalance - lockedFunds
}

export function calculateUserLockedFunds(
  bids: Bid[],
  projectsPendingTransfer: Project[]
) {
  const lockedFunds =
    bids
      .filter(
        (bid) =>
          bid.status === 'pending' &&
          (bid.type === 'buy' || bid.type === 'donate')
      )
      .reduce((acc, bid) => acc + bid.amount, 0) +
    projectsPendingTransfer?.reduce(
      (acc, project) => acc + (project.funding_goal ?? 0),
      0
    )
  return lockedFunds
}

export async function calculateUserFundsAndShares(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
) {
  if (!userId) {
    return { userSpendableFunds: 0, userSellableShares: 0, userShares: 0 }
  }
  const txns = await getFullTxnsByUser(supabase, userId)
  const projectsPendingTransfer = await getProjectsPendingTransferByUser(
    supabase,
    userId
  )
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
    ?.reduce((acc, bid) => acc + bid.amount, 0)
  const userSellableShares = userShares - offeredShares
  const userSpendableFunds = calculateUserSpendableFunds(
    txns,
    userId,
    userBids,
    projectsPendingTransfer
  )
  return { userSpendableFunds, userSellableShares, userShares }
}

export function calculateWithdrawBalance(
  txns: Txn[],
  bids: Bid[],
  userId: string,
  accreditationStatus: boolean
) {
  let withdrawBalance = 0
  const sortedTxns = sortBy(txns, 'created_at')
  sortedTxns.forEach((txn) => {
    const txnType = categorizeTxn(txn, userId)
    withdrawBalance +=
      txn.amount * txnWithdrawMultiplier(txnType, accreditationStatus)
    withdrawBalance = Math.max(withdrawBalance, 0)
  })
  bids.forEach((bid) => {
    if (bid.status === 'pending' && accreditationStatus && bid.type === 'buy') {
      withdrawBalance -= bid.amount
    }
  })
  return Math.max(withdrawBalance, 0)
}

export function calculateCharityBalance(
  txns: Txn[],
  bids: Bid[],
  userId: string,
  accreditationStatus: boolean
) {
  let charityBalance = 0
  const sortedTxns = sortBy(txns, 'created_at')
  sortedTxns.forEach((txn) => {
    const txnType = categorizeTxn(txn, userId)
    charityBalance +=
      txn.amount * txnCharityMultiplier(txnType, accreditationStatus)
    charityBalance = Math.max(charityBalance, 0)
  })
  bids.forEach((bid) => {
    if (
      bid.status === 'pending' &&
      (bid.type === 'donate' || (!accreditationStatus && bid.type === 'buy'))
    ) {
      charityBalance -= bid.amount
    }
  })
  return Math.max(charityBalance, 0)
}

type TxnType =
  | 'incoming profile donation'
  | 'outgoing profile donation'
  | 'share purchase'
  | 'share sale'
  | 'own-project share sale'
  | 'withdraw'
  | 'deposit'
  | 'incoming project donation'
  | 'outgoing project donation'
  | 'non-dollar'

export function categorizeTxn(txn: FullTxn, userId: string) {
  if (txn.token === 'USD') {
    if (txn.to_id === userId) {
      if (txn.project) {
        if (txn.projects?.creator === userId) {
          if (txn.bundle) {
            return 'own-project share sale'
          } else {
            return 'incoming project donation'
          }
        } else {
          return 'share sale'
        }
      } else {
        if (txn.from_id === BANK_ID) {
          return 'deposit'
        } else {
          return 'incoming profile donation'
        }
      }
    } else {
      if (txn.project) {
        if (txn.bundle) {
          return 'share purchase'
        } else {
          return 'outgoing project donation'
        }
      } else {
        if (txn.to_id === BANK_ID) {
          return 'withdraw'
        } else {
          return 'outgoing profile donation'
        }
      }
    }
  } else {
    return 'non-dollar'
  }
}

// The following functions return -1, 0, or 1, depending on the effect that the transaction has on the user's balance types.
// E.g. a donation gets a -1 multiplier for charity, and 0 for withdrawable.
// A deposit gets 1 for charity and 0 for withdrawable for an unaccredited user, and vice versa for accredited users.
// Withdrawable = investable for accredited investors
export function txnCharityMultiplier(txnType: TxnType, accredited: boolean) {
  if (txnType === 'share purchase') {
    return accredited ? 0 : -1
  } else if (
    txnType === 'outgoing project donation' ||
    txnType === 'outgoing profile donation'
  ) {
    return -1
  } else if (
    txnType === 'withdraw' ||
    txnType === 'incoming project donation'
  ) {
    return 0
  } else if (txnType === 'share sale') {
    return accredited ? 0 : 1
  } else if (txnType === 'own-project share sale') {
    return 0
  } else if (txnType === 'incoming profile donation') {
    return 1
  } else if (txnType === 'deposit') {
    return accredited ? 0 : 1
  } else {
    return 0
  }
}

export function txnWithdrawMultiplier(txnType: TxnType, accredited: boolean) {
  if (txnType === 'share purchase') {
    return accredited ? -1 : 0
  } else if (
    txnType === 'outgoing project donation' ||
    txnType === 'outgoing profile donation'
  ) {
    return 0
  } else if (txnType === 'withdraw') {
    return -1
  } else if (txnType === 'incoming project donation') {
    return 1
  } else if (txnType === 'share sale') {
    return accredited ? 1 : 0
  } else if (txnType === 'own-project share sale') {
    return 1
  } else if (txnType === 'incoming profile donation') {
    return 0
  } else if (txnType === 'deposit') {
    return accredited ? 1 : 0
  } else return 0
}
