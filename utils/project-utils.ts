import { FullProject } from '@/db/project'
import { getAmountRaised } from './math'
import { getSponsoredAmount } from './constants'

export function getVoteCount(project: FullProject): number {
  return (
    project._vote_count ??
    project.project_votes.reduce((acc, vote) => vote.magnitude + acc, 0)
  )
}

export function getCommentCount(project: FullProject): number {
  return project._comment_count ?? project.comments.length
}

export function getProjectAmountRaised(project: FullProject): number {
  return (
    project._amount_raised ??
    getAmountRaised(project, project.bids, project.txns)
  )
}

export function getHasPendingTransfers(project: FullProject): boolean {
  return (
    project._has_pending_transfers ??
    project.project_transfers.some((pt) => !pt.transferred)
  )
}

export function getIsRegrantorFunded(project: FullProject): boolean {
  return (
    project._regrantor_funded ??
    project.txns.some(
      (txn) => txn.from_id && getSponsoredAmount(txn.from_id) > 0
    )
  )
}
