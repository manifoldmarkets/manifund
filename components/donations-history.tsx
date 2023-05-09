'use client'
import { Json } from '@/db/database.types'
import { Profile } from '@/db/profile'
import { TxnAndProfiles } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { sortBy } from 'lodash'
import { useState } from 'react'
import { Button, IconButton } from './button'
import { RichContent } from './editor'
import { Col } from './layout/col'
import { Row } from './layout/row'
import { Modal } from './modal'
import { UserAvatarAndBadge } from './user-link'

export function DonationsHistory(props: { donations: TxnAndProfiles[] }) {
  const { donations } = props
  const sortedDonations = sortBy(donations, (txn) => -txn.created_at)
  return (
    <>
      {donations.length > 0 ? (
        <>
          {sortedDonations.map((txn) => {
            if (!txn.profiles) return null
            return (
              <Row
                key={txn.id}
                className="justify-between rounded p-2 hover:bg-gray-200"
              >
                <Row className="items-center gap-1">
                  <UserAvatarAndBadge profile={txn.profiles as Profile} />
                  <span className="text-gray-600"> donated </span>
                  <span>{formatMoney(txn.amount)}</span>
                </Row>
                <Row className="items-center">
                  <span className="text-gray-600">
                    {formatDistanceToNow(new Date(txn.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </Row>
              </Row>
            )
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
