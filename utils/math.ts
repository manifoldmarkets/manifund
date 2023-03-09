import { Project } from '@/db/project'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import { formatLargeNumber } from './formatting'

export function getProposalValuation(project: Project) {
  const investorPercent =
    (TOTAL_SHARES - project.founder_portion) / TOTAL_SHARES
  return project.min_funding / investorPercent
}

//bad because depends on USD and shares txns being right next to each other?
export function getActiveValuation(txns: Txn[], founder_portion: number) {
  let i = txns.length - 1
  let price_usd = 0
  let num_shares = 0
  while (i > 0) {
    if (txns[i].project) {
      if (txns[i].token == 'USD') {
        price_usd = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token != 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          num_shares = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      } else {
        num_shares = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token == 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          price_usd = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      }
    }
    i--
  }
  return -1
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
