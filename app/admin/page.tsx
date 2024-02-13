import { Table, TableRow } from '@/components/table'
import { getUser, isAdmin } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { createAdminClient } from '@/pages/api/_db'
import { PayUser } from './pay-user'
import { VerifyInvestor } from './verify-investor'
import { RoundBidAmounts } from './round-bid-amounts'
import { SupabaseClient } from '@supabase/supabase-js'
import { roundLargeNumber } from '@/utils/formatting'
import { getTxnsByUser, Txn } from '@/db/txn'
import { calculateShares } from '@/utils/math'
import { Donations } from './donations'
import { listProjects } from '@/db/project'
import { GrantVerdict } from './grant-verdict'
import { AddTags } from './add-tags'
import { DownloadTextButton } from './download-text-button'
import { RunScript } from './run-script'
import { ActivateProject } from './activate-project'
import { CreateTxn } from './create-txn'
import clsx from 'clsx'
import Link from 'next/link'

export default async function Admin() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) {
    return <div>Not AUTHORIZED</div>
  }

  const supabaseAdmin = createAdminClient()
  const { data: users } = await supabaseAdmin.from('users').select('*')
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*')
  const userAndProfiles =
    users?.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id)
      return {
        ...user,
        profile,
      }
    }) ?? []
  const charities = profiles?.filter((profile) => profile.type === 'org')
  const projects = await listProjects(supabaseAdmin)
  const projectsToApprove = projects
    .filter(
      (project) =>
        project.stage === 'proposal' &&
        project.approved === null &&
        project.type === 'grant'
    )
    .filter(
      (project) =>
        project.bids.reduce((acc, bid) => acc + bid.amount, 0) >=
        project.min_funding
    )
  const usersById = new Map(userAndProfiles.map((user) => [user.id, user]))
  const getName = (userId: string | null) => {
    return usersById.get(userId ?? '')?.profile?.username
  }

  const { data: txns } = await supabaseAdmin
    .from('txns')
    .select('*')
    .eq('token', 'USD')
    .order('created_at')
  const balances = userBalances(txns ?? [])

  const usersCSV =
    'email,name,username,id,balance\n' +
    userAndProfiles
      .map((user) => {
        return [
          user.email,
          user.profile?.full_name,
          user.profile?.username,
          user.id,
          balances.get(user.id ?? '') ?? 0,
        ].join(',')
      })
      .join('\n')

  return (
    <div>
      <div className="rounded-bl-lg rounded-br-lg bg-gradient-to-r from-orange-500 to-rose-500 px-0 py-8 hover:shadow-lg sm:px-8">
        <h1 className="text-center text-5xl font-semibold text-white">
          Admin Panel
        </h1>
      </div>
      <h2 className="pb-3 pt-10 text-2xl">Projects Pending Approval</h2>
      <Table>
        <thead>
          <tr>
            <th className="p-2 text-center">Creator</th>
            <th className="p-2 text-center">Project</th>
            <th className="p-2 text-center">Grant verdict</th>
          </tr>
        </thead>
        <tbody className="p-2">
          {projectsToApprove.map((project) => (
            <tr key={project.id}>
              <td>
                <Link href={`/${project.profiles.username}`}>
                  {project.profiles.full_name}
                </Link>
              </td>
              <td>
                <Link
                  href={`/projects/${project.slug}`}
                  className={clsx(
                    project.signed_agreement ? 'text-gray-900' : 'text-rose-600'
                  )}
                >
                  {project.title}
                </Link>
              </td>
              <td>
                <GrantVerdict
                  projectId={project.id}
                  lobbying={project.lobbying}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <CreateTxn />
      <DownloadTextButton
        buttonText="Export users.csv"
        toDownload={usersCSV}
        filename="users.csv"
      />
      <RunScript />
      <h1 className="pb-3 pt-10 text-2xl">User Database</h1>
      <Table>
        <thead>
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Username</th>
            <th className="p-2">Id</th>
            <th className="p-2">Accredited</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Pay user</th>
          </tr>
        </thead>
        <tbody className="p-2">
          {userAndProfiles.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.profile?.username}</td>
              <td>{user.id}</td>
              <td>
                <VerifyInvestor
                  userId={user.id ?? ''}
                  accredited={user.profile?.accreditation_status as boolean}
                />
              </td>
              <td>{balances.get(user.id ?? '') ?? 0}</td>
              <td>
                <PayUser userId={user.id ?? ''} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className="pb-3 pt-10 text-2xl">Transactions</h2>
      <Table>
        <thead>
          <tr>
            <th className="p-2">From</th>
            <th className="p-2">To</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Token</th>
            <th className="p-2">Created at</th>
          </tr>
        </thead>
        <tbody>
          {(txns ?? []).map((txn) => (
            <tr key={txn.id}>
              <td>{getName(txn.from_id)}</td>
              <td>{getName(txn.to_id)}</td>
              <td>{txn.amount}</td>
              <td>{txn.token}</td>
              <td>{txn.created_at}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className="pb-3 pt-10 text-2xl">Projects</h2>
      <Table>
        <thead>
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Creator</th>
            <th className="p-2">Min funding</th>
            <th className="p-2">Add tag</th>
            <th className="p-2">Activate project</th>
          </tr>
        </thead>
        <tbody>
          {(projects ?? []).map((project) => {
            return (
              <tr key={project.id}>
                <td className="max-w-sm overflow-hidden">{project.title}</td>
                <td>{getName(project.creator)}</td>
                <td>{project.min_funding}</td>
                <AddTags
                  projectId={project.id}
                  causeSlug={'gcr'}
                  currentCauseSlugs={project.causes.map((cause) => cause.slug)}
                />
                <ActivateProject projectId={project.id} />
              </tr>
            )
          })}
        </tbody>
      </Table>
      <Donations charities={charities ?? []} txns={txns ?? []} />
      <h2>Round Bid Amounts</h2>
      <RoundBidAmounts />
    </div>
  )
}

function userBalances(txns: Txn[]) {
  const balances = new Map<string, number>()
  txns.forEach((txn) => {
    if (txn.from_id) {
      const from = balances.get(txn.from_id) ?? 0
      balances.set(txn.from_id, from - txn.amount)
    }
    const to = balances.get(txn.to_id) ?? 0
    balances.set(txn.to_id, to + txn.amount)
  })
  return balances
}

async function roundDbBidAmounts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('bids').select('*')
  if (error) {
    console.error('Getting bids', error)
  } else {
    data.forEach(async (bid) => {
      console.log(
        'Updating bid',
        bid.id,
        bid.amount,
        '->',
        roundLargeNumber(bid.amount)
      )
      const { error } = await supabase
        .from('bids')
        .update({ amount: roundLargeNumber(bid.amount) })
        .eq('id', bid.id)
      if (error) {
        console.error('Updating bid', error)
      }
    })
  }
}

async function CreatorShares(props: {
  supabase: SupabaseClient
  projectId: string
  projectCreator: string
}) {
  const { supabase, projectId, projectCreator } = props
  const txns = await getTxnsByUser(supabase, projectCreator)
  return <td>{calculateShares(txns, projectCreator, projectId)}</td>
}

// Used when profile type was added
async function setProfilesToIndividual(supabase: SupabaseClient) {
  const { error } = await supabase
    .from('profiles')
    .update({ type: 'individual' })
    // Supabase requres filter for update so I put a weird string that wouldn't apply to any rows
    .neq('full_name', 'aoiwejdio')

  if (error) {
    console.error('Updating profiles', error)
  }
}
