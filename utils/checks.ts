import { Bid } from '@/db/bid'
import { Project } from '@/db/project'

export function checkGrantFundingReady(project: Project, bids: Bid[]) {
  if (project.type !== 'grant') {
    console.error('Project is not a grant')
  } else {
    const totalDonated = bids
      .filter((bid) => bid.status === 'pending' && bid.type === 'donate')
      .reduce((acc, bid) => acc + bid.amount, 0)
    return (
      totalDonated >= project.min_funding &&
      project.approved &&
      project.signed_agreement
    )
  }
}
