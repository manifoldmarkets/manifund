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
                  {txn.notes && (
                    <DonorNotes donorNotes={txn.notes} donor={txn.profiles} />
                  )}
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

function DonorNotes(props: { donorNotes: Json; donor: Profile }) {
  const { donorNotes, donor } = props
  const [open, setOpen] = useState(false)

  return (
    <div>
      <IconButton
        onClick={async () => {
          setOpen(true)
        }}
      >
        <InformationCircleIcon className="h-6 w-6 text-gray-500" />
      </IconButton>
      <Modal open={open}>
        <div>
          <p>{donor.full_name}&apos;s notes:</p>
          <RichContent content={donorNotes} />
        </div>
        <div className="sm:flex-2 mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
          <Button
            type="button"
            color={'gray'}
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}
