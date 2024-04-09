import { createServerClient } from '@/db/supabase-server'
import { FullProject, listProjects } from '@/db/project'
import { getTxnsByUser, TxnAndProfiles } from '@/db/txn'
import { isBefore } from 'date-fns'
import { getAmountRaised } from '@/utils/math'
import { formatMoney } from '@/utils/formatting'
import { createAdminClient } from '@/pages/api/_db'

// Note: These options make /projects static, but not when accessed from Home
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createAdminClient()
  // const projects = await listProjects(supabase)
  // const roundProjects = projects.filter(
  //   (project) =>
  //     project.rounds.title === 'Manifold Community Fund' &&
  //     isBefore(new Date(project.created_at), new Date('2024-01-01'))
  // )
  // const projectTableData = await Promise.all(
  //   roundProjects.map((project) => getProjectTableData(project))
  // )
  // const filteredProjectTableData = projectTableData.filter(
  //   (data) => data.amountRaised > 0
  // )
  // const roundCsvString = [
  //   [
  //     'Project title',
  //     'Project ID',
  //     'Creator name',
  //     'Creator ID',
  //     'Total raised 2023',
  //     'Total withdrawn 2023',
  //     'Location',
  //   ],
  //   ...filteredProjectTableData.map((data) => [...Object.values(data)]),
  // ]
  //   .map((e) => e.join(','))
  //   .join('\n')
  // console.log('=================================')
  // console.log(roundCsvString)

  const deposits = await get2023Deposits(supabase)
  console.log(deposits.length)
  const depositsCsvString = [
    ['Txn ID', 'Recipient name', 'Recipient ID', 'Amount', 'Created at'],
    ...deposits.map((txn) => [
      txn.id,
      txn.profiles?.full_name,
      txn.to_id,
      txn.amount,
      txn.created_at,
    ]),
  ]
    .map((e) => e.join(','))
    .join('\n')
  console.log('=================================')
  console.log(depositsCsvString)
  return (
    <div className="p-5">
      {/* {filteredProjectTableData.map((data) => (
        <div className="grid grid-cols-8">
          <span>{data.title}</span>
          <span>{data.id}</span>
          <span>{data.creator}</span>
          <span>{data.fullName}</span>
          <span>{formatMoney(data.amountRaised)}</span>
          <span>{data.totalCreatorWithdrawals}</span>
          <span>{data.locationDescription}</span>
          <span>{data.round}</span>
        </div>
      ))} */}
    </div>
  )
}

async function get2023Deposits(supabase: any) {
  const { data: txns, error } = await supabase
    .from('txns')
    .select('*, profiles!txns_to_id_fkey(id, full_name)')
    .gte('created_at', '2023-01-01')
    .lte('created_at', '2023-12-31')
    .eq('type', 'deposit')
  if (error) {
    console.error(error)
  }
  const { data: stripe_txns } = await supabase
    .from('stripe_txns')
    .select('txn_id')
  const stripeTxnIds = stripe_txns.map((s: any) => s.txn_id)
  const nonCreditCardTxns = txns.filter(
    (txn: any) => !stripeTxnIds.includes(txn.id)
  )
  return nonCreditCardTxns as TxnAndProfiles[]
}

async function getProjectTableData(project: FullProject) {
  const lastYearProjectTxns = project.txns.filter((txn) =>
    isBefore(new Date(txn.created_at), new Date('2024-01-01'))
  )
  const amountRaised = getAmountRaised(project, [], lastYearProjectTxns)
  const supabase = createServerClient()
  const creatorTxns = await getTxnsByUser(supabase, project.creator)
  const lastYearCreatorTxns = creatorTxns.filter((txn) =>
    isBefore(new Date(txn.created_at), new Date('2024-01-01'))
  )
  let totalCreatorWithdrawals = 0
  for (const txn of lastYearCreatorTxns) {
    if (txn.type === 'withdraw') {
      totalCreatorWithdrawals += txn.amount
    }
  }
  if (project.title === 'Joseph Bloom - Independent AI Safety Research') {
    console.log('Joseph Bloom last year:', lastYearCreatorTxns)
  }
  return {
    title: project.title,
    id: project.id,
    creator: project.creator,
    fullName: project.profiles.full_name,
    amountRaised,
    totalCreatorWithdrawals,
    locationDescription: project.location_description,
    round: project.round,
  }
}
