'use client'
import { BidAndProject } from '@/db/bid'
import { BidText, TableRow, UserBidDisplay } from '@/components/user-bids'
import { RoundTag } from '@/components/tags'

export function ActiveBids(props: {
  bids: BidAndProject[]
  isOwnProfile?: boolean
}) {
  const { bids, isOwnProfile } = props
  const bidsDisplay = bids.map((bid) => (
    <TableRow
      key={bid.id}
      title={bid.projects.title}
      subtitle={
        <BidText
          bid={bid}
          projectType={bid.projects.type}
          stage={bid.projects.stage}
          showValuation={isOwnProfile || bid.projects.stage !== 'proposal'}
        />
      }
      tag={<RoundTag roundTitle={bid.projects.round} />}
      href={`/projects/${bid.projects.slug}`}
      deleteFunction={() => {}}
    />
  ))
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Trade offers</h1>
      <div className="overflow-hidden rounded-md bg-white shadow">
        <table
          role="list"
          className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
        >
          {bidsDisplay}
        </table>
      </div>
    </div>
  )
}
