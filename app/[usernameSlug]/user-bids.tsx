import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/db/supabase-server'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { getProjectById } from '@/db/project'
import Link from 'next/link'

type Bid = Database['public']['Tables']['bids']['Row']

export async function UserBids(props: { user: string }) {
  const { user } = props
  const supabase = createClient()
  const bids: Bid[] = await getBidsByUser(supabase, user)
  console.log(bids)
  const bidsDisplay = bids.map((item) => (
    <li key={item.id}>
      {/* @ts-expect-error Server Component */}
      <BidDisplay
        supabase={supabase}
        project_id={item.project}
        amount={item.amount}
        valuation={item.valuation}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-2xl">Bids</h1>
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

async function BidDisplay(props: {
  supabase: SupabaseClient
  project_id: string
  amount: number
  valuation: number
}) {
  const { supabase, project_id, amount, valuation } = props
  const project = await getProjectById(supabase, project_id)
  return (
    <Link href={`/projects/${project.slug}`} className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-md text-md truncate text-orange-600">
            {project.title}
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
    </Link>
  )
}
