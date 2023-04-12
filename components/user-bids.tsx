import { Bid } from '@/db/bid'
import { FullProject, Project } from '@/db/project'
import { useSupabase } from '@/db/supabase-provider'
import { formatDate, formatMoney } from '@/utils/formatting'
import { deleteBid } from '@/db/bid'
import { Menu } from '@headlessui/react'
import {
  CalendarIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoundTag } from './tags'

export function UserBidDisplay(props: {
  bid: Bid
  project: Project
  isOwnProfile?: boolean
}) {
  const { bid, project, isOwnProfile } = props
  const { supabase } = useSupabase()
  const router = useRouter()
  return (
    <div className="group flex justify-between px-5 py-4 hover:bg-gray-50 sm:px-6">
      <Link href={`/projects/${project.slug}`} className="w-full">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">
            {project.title}
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <RoundTag roundTitle={project.round} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <BidText
              bid={bid}
              stage={project.stage}
              showValuation={isOwnProfile || project.stage !== 'proposal'}
            />
          </div>
          {project.stage === 'proposal' && project.auction_close ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <p>Closing on {formatDate(project.auction_close)}</p>
            </div>
          ) : null}
        </div>
      </Link>
      {isOwnProfile && (
        <Menu as="div" className="relative z-10 inline-block">
          <Menu.Button>
            <EllipsisVerticalIcon className="relative left-2 h-6 w-6 text-gray-400 hover:cursor-pointer" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 top-4 z-10 mt-2 w-24 origin-top-right rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active && 'bg-rose-100'
                  } flex h-full w-full justify-between  p-2 text-rose-600`}
                  onClick={() => {
                    deleteBid(supabase, bid.id)
                    router.refresh()
                  }}
                >
                  <TrashIcon className="h-6 w-6" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </div>
  )
}

function BidText(props: { bid: Bid; stage: string; showValuation: boolean }) {
  const { bid, stage, showValuation } = props
  switch (stage) {
    case 'proposal':
      return (
        <div className="flex items-center">
          <p className="text-sm text-gray-500">
            Bid&nbsp;
            <span className="text-black">{formatMoney(bid.amount)}</span>
            {showValuation && (
              <span>
                &nbsp;@&nbsp;
                <span className="text-black">{formatMoney(bid.valuation)}</span>
                &nbsp;valuation
              </span>
            )}
          </p>
        </div>
      )
    case 'active':
      return (
        <div className="flex items-center text-sm text-gray-500">
          Offer to&nbsp;
          <BuySellTag bidType={bid.type} />
          <span className="text-black">&nbsp;{formatMoney(bid.amount)}</span>
          <span>
            &nbsp;@&nbsp;
            <span className="text-black">{formatMoney(bid.valuation)}</span>
            &nbsp;valuation
          </span>
        </div>
      )
    default:
      return <></>
  }
}

function BuySellTag(props: { bidType: 'buy' | 'sell' | 'ipo' }) {
  const { bidType } = props
  const tagText = bidType === 'buy' ? 'BUY' : 'SELL'
  const tagColor = bidType === 'buy' ? 'bg-emerald-100' : 'bg-rose-100'
  const textColor = bidType === 'buy' ? 'text-emerald-500' : 'text-rose-500'
  return (
    <div
      className={`rounded-sm px-2 py-1 text-xs font-bold ${tagColor} ${textColor}`}
    >
      {tagText}
    </div>
  )
}
