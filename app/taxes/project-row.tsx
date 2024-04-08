import { FullProject } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { getTxnsByUser } from '@/db/txn'
import { getAmountRaised } from '@/utils/math'
import { isBefore } from 'date-fns'

export async function ProjectRow(props: { project: FullProject }) {
  const { project } = props
  // Only count donations that have already gone through
  const lastYearProjectTxns = project.txns.filter((txn) =>
    isBefore(new Date(txn.created_at), new Date('2024-01-01'))
  )
  const amountRaised = getAmountRaised(project, [], lastYearProjectTxns)
  const supabase = createServerClient()
  const creatorTxns = await getTxnsByUser(supabase, project.creator)
  const lastYearCreatorTxns = creatorTxns.filter((txn) =>
    isBefore(new Date(txn.created_at), new Date('2024-01-01'))
  )
  const totalCreatorWithdrawals = lastYearCreatorTxns.reduce((total, txn) => {
    return txn.type === 'withdraw' ? txn.amount + total : 0
  }, 0)
  return (
    <div className="grid grid-cols-8">
      <span>{project.title}</span>
      <span>{project.id}</span>
      <span>{project.creator}</span>
      <span>{project.profiles.full_name}</span>
      <span>{amountRaised}</span>
      <span>{totalCreatorWithdrawals}</span>
      <span>{project.location_description}</span>
      <span>{project.round}</span>
    </div>
  )
}
