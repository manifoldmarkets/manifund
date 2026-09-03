import { createAdminClient } from '@/db/supabase-admin'
import { WithdrawalRequest } from '@/db/withdrawal-request'
import { formatMoneyPrecise } from '@/utils/formatting'
import { MarkSentButton } from './mark-sent-button'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  awaiting_recipient: 'Waiting on their bank details',
  ready_to_pay: 'Ready to pay',
  pending_approval: 'Awaiting your approval in Mercury',
  needs_manual: 'Send by hand — India/Philippines',
  sent: 'Sent',
  failed: 'Failed',
  rejected: 'Rejected',
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000)
  return days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`
}

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*, profiles!withdrawal_requests_profile_id_fkey(username, full_name)')
    .order('requested_at', { ascending: false })
    .limit(100)
    .throwOnError()
  const requests = (data ?? []) as (WithdrawalRequest & {
    profiles?: { username: string; full_name: string } | null
  })[]

  const manual = requests.filter((r) => r.status === 'needs_manual')
  const others = requests.filter((r) => r.status !== 'needs_manual')

  return (
    <div className="flex flex-col gap-8 p-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Needs a manual wire</h2>
        <p className="max-w-2xl text-sm text-gray-500">
          India and the Philippines need a purpose code that Mercury&apos;s API can&apos;t send.
          Their bank details are already in Mercury, so send it from the dashboard and mark it sent
          here — that records the timestamp and emails the grantee.
        </p>
        {manual.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing waiting.</p>
        ) : (
          <Table rows={manual} showAction />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Recent withdrawals</h2>
        <Table rows={others} />
      </section>
    </div>
  )
}

function Table(props: {
  rows: (WithdrawalRequest & { profiles?: { username: string; full_name: string } | null })[]
  showAction?: boolean
}) {
  const { rows, showAction } = props
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="p-3 text-left">Who</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 text-left">Method</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Requested</th>
            {showAction && <th className="p-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-gray-100">
              <td className="p-3">{r.profiles?.full_name ?? r.profile_id}</td>
              <td className="p-3 text-right font-mono tabular-nums">
                {formatMoneyPrecise(Number(r.amount))}
              </td>
              <td className="p-3 text-gray-500">
                {r.payment_method === 'ach' ? 'ACH' : 'Intl wire'}
              </td>
              <td className="p-3 text-gray-500">{STATUS_LABELS[r.status] ?? r.status}</td>
              <td className="p-3 text-gray-500">{daysAgo(r.requested_at)}</td>
              {showAction && (
                <td className="p-3 text-right">
                  <MarkSentButton requestId={r.id} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
