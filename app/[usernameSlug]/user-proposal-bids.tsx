'use client'
import { BidAndProject, deleteBid } from '@/db/bid'
import { ThickTableRow } from '@/components/tables'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { RoundTag } from '@/components/tags'
import { BidText } from './user-active-bids'

export function ProposalBids(props: {
  bids: BidAndProject[]
  isOwnProfile?: boolean
}) {
  const { bids, isOwnProfile } = props
  const { supabase } = useSupabase()
  const router = useRouter()
  const bidsDisplay = bids.map((bid) => (
    <ThickTableRow
      key={bid.id}
      title={bid.projects.title}
      subtitle={
        <BidText
          bid={bid}
          stage={bid.projects.stage}
          projectType={bid.projects.type}
          showValuation={isOwnProfile || bid.projects.type === 'grant'}
        />
      }
      href={`/projects/${bid.projects.slug}`}
      tag={<RoundTag roundTitle={bid.projects.round} />}
      deleteFunction={async () => {
        await deleteBid(supabase, bid.id)
        router.refresh()
      }}
    />
  ))
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Proposal bids</h1>
      <table
        role="list"
        className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
      >
        {bidsDisplay}
      </table>
    </div>
  )
}
