import { FullProject, LiteProject } from '@/db/project'
import { calculateAmountRaised } from './math'
import { getSponsoredAmount } from './constants'

// Union type - only LiteProject has discriminator
export type ProjectType = FullProject | LiteProject

export function isLiteProject(project: ProjectType): project is LiteProject {
  return '_type' in project && project._type === 'lite'
}

// Helper functions that work with both types
export function getVoteCount(project: ProjectType): number {
  if (isLiteProject(project)) {
    return project.vote_count
  }
  return project.project_votes.reduce((acc, vote) => vote.magnitude + acc, 0)
}

export function getCommentCount(project: ProjectType): number {
  if (isLiteProject(project)) {
    return project.comment_count
  }
  return project.comments.length
}

export function getAmountRaised(project: ProjectType): number {
  if (isLiteProject(project)) {
    return project.amount_raised
  }
  return calculateAmountRaised(project, project.bids, project.txns)
}

export function getRegrantorFunded(project: ProjectType): boolean {
  if (isLiteProject(project)) {
    return project.regrantor_funded
  }
  return project.txns.some(
    (txn) => txn.from_id && getSponsoredAmount(txn.from_id) > 0
  )
}

export function hasPendingTransfers(project: ProjectType): boolean {
  if (isLiteProject(project)) {
    return project.has_pending_transfers
  }
  return project.project_transfers.some((pt) => !pt.transferred)
}

export function getProjectTransferRecipient(
  project: ProjectType
): string | undefined {
  if (isLiteProject(project)) {
    // LiteProject doesn't have transfer details, so return undefined
    return undefined
  }

  const incompleteTransfers = project.project_transfers.filter(
    (pt) => !pt.transferred
  )

  if (incompleteTransfers.length > 0) {
    return incompleteTransfers[0].recipient_name
  }

  if (project.project_transfers.length > 0 && !project.profiles.full_name) {
    return project.project_transfers[0].recipient_name
  }

  return undefined
}

// Hot score calculation that works with both project types
export function hotScore(project: ProjectType): number {
  // Time in days since project was created
  let time = Date.now() - new Date(project.created_at).getTime()
  time = time / (1000 * 60 * 60 * 24)

  const votes = getVoteCount(project)
  const comments = getCommentCount(project)
  const raised = getAmountRaised(project)

  const points = votes * 2 + comments + Math.log(raised + 1) * 3
  // Hacker News newness algorithm
  const score = (points + 2) / time ** 1.8

  return -score
}
