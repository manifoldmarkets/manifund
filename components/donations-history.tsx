'use client'
import { Profile } from '@/db/profile'
import { TxnAndProfiles } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { orderBy, uniq } from 'lodash'
import { useState } from 'react'
import { Avatar } from './avatar'
import { RightCarrotIcon } from './icons'
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

export function ExpandableDonationsHistory(props: {
  donations: TxnAndProfiles[]
}) {
  const { donations } = props
  const [expanded, setExpanded] = useState(false)
  const sortedDonations = orderBy(donations, 'created_at', 'desc')
  const recentDonations = sortedDonations.slice(0, 3)
  const recentDonors = uniq(recentDonations.map((txn) => txn.profiles))
  return (
    <>
      <Row className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-gray-800"
        >
          <RightCarrotIcon
            className={clsx('h-4 w-6', expanded && 'rotate-90')}
          />
          <span className="text-lg">
            {expanded ? 'Hide donations' : 'Show all donations'}
          </span>
        </button>
        {!expanded && (
          <Row className="items-center gap-1 text-gray-600">
            recent donations from
            {recentDonors.map((donor) => {
              return donor ? (
                <Avatar
                  key={donor.id}
                  username={donor.username}
                  avatarUrl={donor.avatar_url}
                  id={donor.id}
                  size="xs"
                />
              ) : null
            })}
          </Row>
        )}
      </Row>
      {expanded && <DonationsHistory donations={donations} />}
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
