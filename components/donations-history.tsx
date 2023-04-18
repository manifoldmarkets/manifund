import { Profile } from '@/db/profile'
import { TxnAndProfiles } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import { formatDistanceToNow } from 'date-fns'
import { sortBy } from 'lodash'
import { UserAvatarAndBadge } from './user-link'

export function DonationsHistory(props: { donations: TxnAndProfiles[] }) {
  const { donations } = props
  const sortedDonations = sortBy(donations, (txn) => -txn.created_at)
  return (
    <>
      {donations.length > 0 ? (
        <>
          {sortedDonations.map((txn) => (
            <div
              key={txn.id}
              className="flex justify-between rounded p-2 hover:bg-gray-200"
            >
              <div className="flex items-center gap-1">
                <UserAvatarAndBadge profile={txn.profiles as Profile} />
                <span className="text-gray-600"> donated </span>
                <span>{formatMoney(txn.amount)}</span>
              </div>
              <span className="text-gray-600">
                {formatDistanceToNow(new Date(txn.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))}
        </>
      ) : (
        <p className="mt-3 text-center italic text-gray-500">
          No donations yet. Be the first!
        </p>
      )}{' '}
    </>
  )
}
