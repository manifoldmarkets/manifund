'use client'
import { BidAndProject, deleteBid } from '@/db/bid'
import { Table, TableRow } from '@/components/table'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { RoundTag } from '@/components/tags'
import { BidText } from './profile-active-bids'

export function ProposalBids(props: {
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
          stage={bid.projects.stage}
          projectType={bid.projects.type}
          showValuation={isOwnProfile || bid.projects.type === 'grant'}
        />
      }
      href={`/projects/${bid.projects.slug}`}
      deleteFunction={
        isOwnProfile
          ? async () => {
              await deleteBid(supabase, bid.id)
              router.refresh()
            }
          : undefined
      }
    />
  ))
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">Proposal bids</h1>
      <Table>{bidsDisplay}</Table>
    </div>
  )
}
