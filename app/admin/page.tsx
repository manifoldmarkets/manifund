import { createAdminClient } from '@/pages/api/_db'
import { PayUser } from './pay-user'
import { VerifyInvestor } from './verify-investor'
import { DownloadTextButton } from './download-text-button'
import { userBalances } from './utils'
import Link from 'next/link'
import { CircleStackIcon } from '@heroicons/react/24/solid'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table-catalyst'

export default async function UsersPage() {
  const supabaseAdmin = createAdminClient()
  const [{ data: users }, { data: profiles }, { data: txns }] =
    await Promise.all([
      supabaseAdmin.from('users').select('*'),
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin
        .from('txns')
        .select('*')
        .eq('token', 'USD')
        .order('created_at'),
    ])

  const userAndProfiles =
    users?.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id)
      return { ...user, profile }
    }) ?? []

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
    <>
      <DownloadTextButton
        buttonText="Export users.csv"
        toDownload={usersCSV}
        filename="users.csv"
      />
      <Table
        dense
        className="[--gutter:theme(spacing.0)] sm:[--gutter:theme(spacing.0)]"
      >
        <TableHead>
          <TableRow>
            <TableHeader className="p-2">DB</TableHeader>
            <TableHeader className="p-2">Email</TableHeader>
            <TableHeader className="p-2">Username</TableHeader>
            <TableHeader className="p-2">Accredited</TableHeader>
            <TableHeader className="p-2">Balance</TableHeader>
            <TableHeader className="p-2">Pay user</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="p-2 text-sm">
          {userAndProfiles.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="pr-2">
                <Link
                  href={`https://supabase.com/dashboard/project/fkousziwzbnkdkldjper/editor/27095?filter=id%3Aeq%3A${user.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  <CircleStackIcon className="inline h-3 w-3" />
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.profile?.username}</TableCell>
              <TableCell>
                <VerifyInvestor
                  userId={user.id ?? ''}
                  accredited={user.profile?.accreditation_status as boolean}
                />
              </TableCell>
              <TableCell>
                {Number((balances.get(user.id ?? '') ?? 0).toFixed(2))}
              </TableCell>
              <TableCell>
                <PayUser userId={user.id ?? ''} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
