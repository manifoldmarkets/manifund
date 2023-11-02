import { Bid } from '@/db/bid'
import { Database } from '@/db/database.types'
import { Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { TOTAL_SHARES } from '@/db/project'
import { FullTxn, Txn, TxnAndProfiles, TxnAndProject } from '@/db/txn'
import { SupabaseClient } from '@supabase/supabase-js'
import { isBefore } from 'date-fns'
import { isNull, orderBy, sortBy } from 'lodash'
import { isCharitableDeposit } from './constants'

export function getProposalValuation(project: Project) {
  const investorPercent =
    (TOTAL_SHARES - project.founder_shares - (project.amm_shares ?? 0)) /
    TOTAL_SHARES
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
    const balanceEffect =
      txn.to_id === userId ? (txn.from_id === userId ? 0 : 1) : -1
    if (txn.token === 'USD') {
      balance += txn.amount * balanceEffect
    }
  })
  return balance
}

export function getAmountRaised(project: Project, bids?: Bid[], txns?: Txn[]) {
  return (
    (project.stage === 'proposal'
      ? bids
          ?.filter(
            (bid) =>
              (bid.type === 'buy' ||
                bid.type === 'assurance buy' ||
                bid.type === 'donate') &&
              bid.status === 'pending'
          )
          .reduce((acc, bid) => acc + bid.amount, 0)
      : txns
          ?.filter(
            (txn) => txn.to_id === project.creator && txn.token === 'USD'
          )
          .reduce((acc, txn) => acc + txn.amount, 0)) ?? 0
  )
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

export function calculateUserLockedFunds(bids: Bid[]) {
  const lockedFunds = bids
    .filter(
      (bid) =>
        bid.status === 'pending' &&
        (bid.type === 'buy' || bid.type === 'donate')
    )
    .reduce((acc, bid) => acc + bid.amount, 0)
  return lockedFunds
}

export function calculateShares(
  txns: Txn[],
  userId: string,
  projectId: string
) {
  let shares = 0
  txns.forEach((txn) => {
    const incoming = txn.to_id === userId
    if (txn.token === projectId) {
      shares += incoming ? txn.amount : -txn.amount
    }
  })
  return shares
}

export function calculateOfferedShares(bids: Bid[], projectId: string) {
  const offeredShares = bids
    .filter(
      (bid) =>
        bid.type === 'sell' &&
        bid.status === 'pending' &&
        bid.project === projectId
    )
    ?.reduce((acc, bid) => acc + bid.amount, 0)
  return offeredShares
}

export function calculateSellableShares(
  txns: Txn[],
  bids: Bid[],
  projectId: string,
  userId: string
) {
  const shares = calculateShares(txns, userId, projectId)
  const offeredShares = calculateOfferedShares(bids, projectId)
  return shares - offeredShares
}

export function calculateCashBalance(
  txns: TxnAndProject[],
  bids: Bid[],
  userId: string,
  accreditationStatus: boolean
) {
  let cashBalance = 0
  const sortedTxns = sortBy(txns, 'created_at')
  sortedTxns.forEach((txn) => {
    const txnType = categorizeTxn(txn, userId)
    cashBalance +=
      txn.amount * getTxnCashMultiplier(txn, userId, accreditationStatus)
    cashBalance = Math.max(cashBalance, 0)
  })
  bids.forEach((bid) => {
    if (bid.status === 'pending' && accreditationStatus && bid.type === 'buy') {
      cashBalance -= bid.amount
    }
  })
  return Math.max(cashBalance, 0)
}

export function calculateCharityBalance(
  txns: TxnAndProject[],
  bids: Bid[],
  userId: string,
  accreditationStatus: boolean
) {
  let charityBalance = 0
  const sortedTxns = sortBy(txns, 'created_at')
  sortedTxns.forEach((txn) => {
    const txnType = categorizeTxn(txn, userId)
    charityBalance +=
      txn.amount * getTxnCharityMultiplier(txn, userId, accreditationStatus)
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

type TxnType2 =
  | 'incoming profile donation'
  | 'outgoing profile donation'
  | 'share purchase'
  | 'share sale'
  | 'own-project share sale'
  | 'withdraw'
  | 'deposit'
  | 'incoming project donation'
  | 'outgoing project donation'
  | 'own project donation'
  | 'cash to charity transfer'
  | 'non-dollar'
  | 'other'

function getTxnCharityMultiplier(
  txn: TxnAndProject,
  userId: string,
  accredited: boolean
) {
  if (
    txn.token !== 'USD' ||
    (txn.from_id !== userId && txn.to_id !== userId) ||
    txn.type === 'withdraw'
  ) {
    return 0
  }
  const isIncoming = txn.to_id === userId
  const actuallyAccredited =
    isBefore(new Date(txn.created_at), new Date('2023-11-02')) && accredited
  if (txn.type === 'cash to charity transfer') {
    return 1
  }
  if (txn.type === 'project donation') {
    return isIncoming ? 0 : 1
  }
  if (txn.type === 'profile donation') {
    return isIncoming ? 1 : -1
  }
  if (txn.type === 'user to amm trade' || txn.type === 'user to user trade') {
    const isOwnProject = txn.projects?.creator === userId
    if (isOwnProject || actuallyAccredited) {
      return 0
    } else {
      return isIncoming ? 1 : -1
    }
  }
  if (txn.type === 'amm seed') {
    return isIncoming ? 1 : 0
  }
  if (txn.type === 'deposit') {
    return actuallyAccredited ? 0 : 1
  }
  return 0
}

function getTxnCashMultiplier(
  txn: FullTxn,
  userId: string,
  accredited: boolean
) {
  if (
    txn.token !== 'USD' ||
    (txn.from_id !== userId && txn.to_id !== userId) ||
    txn.type === 'profile donation'
  ) {
    return 0
  }
  const isIncoming = txn.to_id === userId
  const actuallyAccredited =
    isBefore(new Date(txn.created_at), new Date('2023-11-02')) && accredited
  if (txn.type === 'cash to charity transfer') {
    return -1
  }
  if (txn.type === 'project donation') {
    return isIncoming ? 1 : 0
  }
  if (txn.type === 'user to amm trade' || txn.type === 'user to user trade') {
    const isOwnProject = txn.projects?.creator === userId
    if (isOwnProject || actuallyAccredited) {
      return isIncoming ? 1 : -1
    } else {
      return 0
    }
  }
  if (txn.type === 'amm seed') {
    return isIncoming ? 0 : -1
  }
  if (txn.type === 'deposit') {
    return actuallyAccredited ? 1 : 0
  }
  if (txn.type === 'withdraw') {
    return -1
  }
  return 0
}
export function categorizeTxn(txn: FullTxn, userId: string) {
  if (txn.token === 'USD') {
    if (txn.to_id === userId) {
      if (txn.from_id === userId) {
        if (txn.project && !txn.bundle) {
          return 'own project donation'
        } else if (!txn.bundle) {
          4
          return 'cash to charity transfer'
        } else return 'other' // This shouldn't happen: bundle should come with project
      }
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
        if (
          txn.from_id === process.env.NEXT_PUBLIC_PROD_BANK_ID &&
          !isCharitableDeposit(txn.id)
        ) {
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
        if (txn.to_id === process.env.NEXT_PUBLIC_PROD_BANK_ID) {
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

// These functions return -1, 0, or 1, depending on the effect that the transaction has on the user's balance types.
// E.g. an outgoing donation gets a -1 multiplier for charity, and 0 for withdrawable.
// A deposit gets 1 for charity and 0 for withdrawable for an unaccredited user, and vice versa for accredited users.
// Withdrawable = investable for accredited investors
export function txnCharityMultiplier(txnType: TxnType2, accredited: boolean) {
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
  } else if (txnType === 'own project donation') {
    return -1
  } else if (txnType === 'cash to charity transfer') {
    return 1
  } else {
    return 0
  }
}

export function txnCashMultiplier(txnType: TxnType2, accredited: boolean) {
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
  } else if (txnType === 'own project donation') {
    return 1
  } else if (txnType === 'cash to charity transfer') {
    return -1
  } else return 0
}
