'use client'
import { BidAndProject, deleteBid } from '@/db/bid'
import { BidText, TableRow } from '@/components/tables'
import { RoundTag } from '@/components/tags'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'

export function ActiveBids(props: {
  bids: BidAndProject[]
  isOwnProfile?: boolean
}) {
  const { bids, isOwnProfile } = props
  const { supabase } = useSupabase()
  const router = useRouter()
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
      deleteFunction={async () => {
        await deleteBid(supabase, bid.id)
        router.refresh()
      }}
    />
  ))
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Trade offers</h1>
      <table
        role="list"
        className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
      >
        {bidsDisplay}
      </table>
    </div>
  )
}
