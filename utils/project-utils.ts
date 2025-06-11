import { FullProject, LiteProject } from '@/db/project'

// Union type with discriminator
export type ProjectType =
  | (FullProject & { _type: 'full' })
  | (LiteProject & { _type: 'lite' })

// Type guards
export function isFullProject(
  project: ProjectType
): project is FullProject & { _type: 'full' } {
  return project._type === 'full'
}

export function isLiteProject(
  project: ProjectType
): project is LiteProject & { _type: 'lite' } {
  return project._type === 'lite'
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
  // For FullProject, we need to import the calculation logic
  // This is imported from math.ts
  const { getAmountRaised: calculateAmountRaised } = require('@/utils/math')
  return calculateAmountRaised(project, project.bids, project.txns)
}

export function getRegrantorFunded(project: ProjectType): boolean {
  if (isLiteProject(project)) {
    return project.regrantor_funded
  }
  // For FullProject, check if any txn is from a regrantor
  const { getSponsoredAmount } = require('@/utils/constants')
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

// Add discriminator to existing projects
export function addProjectDiscriminator<T extends FullProject | LiteProject>(
  project: T,
  type: 'full' | 'lite'
): T & { _type: 'full' | 'lite' } {
  return {
    ...project,
    _type: type,
  }
}

// Batch conversion helpers
export function addFullProjectDiscriminators(
  projects: FullProject[]
): (FullProject & { _type: 'full' })[] {
  return projects.map((p) => addProjectDiscriminator(p, 'full'))
}

export function addLiteProjectDiscriminators(
  projects: LiteProject[]
): (LiteProject & { _type: 'lite' })[] {
  return projects.map((p) => addProjectDiscriminator(p, 'lite'))
}
