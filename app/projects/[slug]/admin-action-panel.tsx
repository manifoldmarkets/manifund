'use client'
import { Row } from '@/components/layout/row'
import { FullProject } from '@/db/project'
import { GrantVerdict } from '@/app/admin/grant-verdict'
import { BidAndProfile } from '@/db/bid'
import { getAmountRaised, getMinIncludingAmm } from '@/utils/math'
import { TxnAndProfiles } from '@/db/txn'
import { CheckBadgeIcon } from '@heroicons/react/20/solid'

export function AdminActionPanel(props: {
  project: FullProject
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
}) {
  const { project, projectBids, projectTxns } = props
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
  const minIncludingAmm = getMinIncludingAmm(project)

  // Only show approve button for projects that need approval
  // Based on /admin/approvals logic: stage === 'proposal', approved === null, and reached min funding
  const needsApproval =
    project.stage === 'proposal' && project.approved === null && amountRaised >= minIncludingAmm

  if (!needsApproval) {
    return null
  }

  return (
    <Row className="items-center gap-1" id="admin-actions">
      <GrantVerdict
        projectId={project.id}
        lobbying={project.lobbying}
        buttonContent={
          <>
            <CheckBadgeIcon className="relative right-1 h-4 w-4" />
            Approve
          </>
        }
      />
    </Row>
  )
}
