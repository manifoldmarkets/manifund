'use client'
import { Profile } from '@/db/profile'
import { TxnAndProfiles } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import { formatDistanceToNow } from 'date-fns'
import { orderBy } from 'lodash'
import { Row } from './layout/row'
import { UserAvatarAndBadge } from './user-link'

export function DonationsHistory(props: { donations: TxnAndProfiles[] }) {
  const { donations } = props
  const sortedDonations = orderBy(donations, 'created_at', 'desc')
  return (
    <>
      {donations.length > 0 ? (
        <>
          {sortedDonations.map((txn) => {
            return txn.profiles ? <Donation txn={txn} /> : null
          })}
        </>
      ) : (
        <p className="mt-3 text-center italic text-gray-500">
          No donations yet. Be the first!
        </p>
      )}{' '}
    </>
  )
}

export function Donation(props: { txn: TxnAndProfiles }) {
  const { txn } = props
  return (
    <Row key={txn.id} className="justify-between rounded p-2">
      <Row className="items-center gap-1">
        <UserAvatarAndBadge profile={txn.profiles as Profile} />
        <span className="text-gray-600"> donated </span>
        <span>{formatMoney(txn.amount)}</span>
      </Row>
      <Row className="items-center">
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(txn.created_at), {
            addSuffix: true,
          })}
        </span>
      </Row>
    </Row>
  )
}
