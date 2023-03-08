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

export function Bids(props: { bids: BidAndProject[] }) {
  const { bids } = props
  const bidsDisplay = bids.map((item) => (
    <li key={item.id}>
      <BidDisplay
        bid_id={item.id}
        project={item.projects}
        amount={item.amount}
        valuation={item.valuation}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-2xl">Proposal Bids</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bidsDisplay}
        </ul>
      </div>
    </div>
  )
}

function BidDisplay(props: {
  bid_id: string
  project: Project
  amount: number
  valuation: number
}) {
  const { bid_id, project, amount, valuation } = props
  const { supabase, session } = useSupabase()
  const router = useRouter()
  if (project.stage != 'proposal') {
    return <div className="hidden"></div>
  }
  return (
    <div className="group flex justify-between px-5 py-4 hover:bg-gray-50 sm:px-6">
      <Link href={`/projects/${project.slug}`} className="w-full">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">
            {project.title}
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <RoundTag round={project.round} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              Bid&nbsp;
              <span className="text-black">{formatMoney(amount)}</span>
              &nbsp;@&nbsp;
              <span className="text-black">{formatMoney(valuation)}</span>
              &nbsp;valuation
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <p>Closing on {formatDate(project.auction_close)}</p>
          </div>
        </div>
      </Link>
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
                  deleteBid(supabase, bid_id)
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
    </div>
  )
}

async function deleteBid(supabase: SupabaseClient, bid_id: string) {
  const { error } = await supabase
    .from('bids')
    .update({ status: 'deleted' })
    .eq('id', bid_id)
  if (error) {
    console.log(error)
  }
}
