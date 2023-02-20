import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/db/supabase-server'
import {
  EllipsisHorizontalIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

type Bid = Database['public']['Tables']['bids']['Row']

export async function UserBids(props: { user: string }) {
  const { user } = props
  const supabase = createClient()
  const bids: Bid[] = await getBidsByUser(supabase, user)
  console.log(bids)
  const bidsDisplay = bids.map((item) => (
    <li key={item.id}>
      <BidDisplay
        project={item.project}
        amount={item.amount}
        valuation={item.valuation}
      />
    </li>
  ))
  return (
    <div>
      <h1>UserBids</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bidsDisplay}
        </ul>
      </div>
    </div>
  )
}

async function getBidsByUser(supabase: SupabaseClient, user: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('bidder', user)
  if (error) {
    throw error
  }
  return data as Bid[]
}

function BidDisplay(props: {
  project: string
  amount: number
  valuation: number
}) {
  const { project, amount, valuation } = props
  console.log('project', project)
  return (
    <a href="#" className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-orange-600">
            {project}
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <p className="inline-flex rounded-full bg-amber-100 px-2 text-xs font-semibold leading-5 text-amber-800">
              Seed
            </p>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              bid&nbsp;<span className="text-black">${amount}</span>
              &nbsp;@&nbsp;
              <span className="text-black">${valuation}</span>&nbsp;valuation
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <p>Closing on March 8, 2022</p>
          </div>
        </div>
      </div>
    </a>
  )
}
