import { Table } from '@/components/table'
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
import { CategorizeTxns } from './categorize-txns'

export default async function Admin() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) {
    return <div>Not authorized</div>
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
        project.signed_agreement &&
        project.approved === null
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
      <h1>Admin</h1>
      <DownloadTextButton
        buttonText="Export users.csv"
        toDownload={usersCSV}
        filename="users.csv"
      />
      <CategorizeTxns txns={txns ?? []} />
      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Id</th>
            <th>Accredited</th>
            <th>Balance</th>
            <th>Pay user</th>
          </tr>
        </thead>
        <tbody>
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
      <h1>Projects Pending Approval</h1>
      <Table>
        <thead>
          <tr>
            <th>Creator</th>
            <th>Project</th>
            <th>Grant verdict</th>
          </tr>
        </thead>
        <tbody>
          {projectsToApprove.map((project) => (
            <tr key={project.id}>
              <td>
                <a href={`/${project.profiles.username}`}>
                  {project.profiles.full_name}
                </a>
              </td>
              <td>
                <a href={`/projects/${project.slug}`}>{project.title}</a>
              </td>
              <td>
                <GrantVerdict projectId={project.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2>Transactions</h2>
      <Table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Token</th>
            <th>Created at</th>
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
      <h2>Projects</h2>
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Creator</th>
            <th>Min funding</th>
            <th>Add tag</th>
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
