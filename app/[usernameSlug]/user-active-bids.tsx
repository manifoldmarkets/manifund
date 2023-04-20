'use client'
import { BidAndProject } from '@/db/bid'
import { UserBidDisplay } from '@/components/user-bids'

export function ActiveBids(props: {
  bids: BidAndProject[]
  isOwnProfile?: boolean
}) {
  const { bids, isOwnProfile } = props
  const bidsDisplay = bids.map((bid) => (
    <li key={bid.id}>
      <UserBidDisplay
        bid={bid}
        project={bid.projects}
        isOwnProfile={isOwnProfile}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Trade offers</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bidsDisplay}
        </ul>
      </div>
    </div>
  )
}
