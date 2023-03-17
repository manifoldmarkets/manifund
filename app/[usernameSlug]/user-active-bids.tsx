'use client'
import { SupabaseClient } from '@supabase/supabase-js'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { RoundTag } from '@/components/round-tag'
import { BidAndProject } from '@/db/bid'
import { Project } from '@/db/project'
import { formatMoney, formatDate } from '@/utils/formatting'
import { TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import Link from 'next/link'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { UserBidDisplay } from '@/components/user-bids'

export function ActiveBids(props: {
  bids: BidAndProject[]
  isOwnProfile: boolean
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
      <h1 className="text-2xl">Trade offers</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bidsDisplay}
        </ul>
      </div>
    </div>
  )
}
