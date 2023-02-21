import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/db/supabase-server'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { getIncomingTxnsByUser } from '@/db/txn'
import { getProjectById } from '@/db/project'
import { RoundTag } from '@/components/round-tag'
import Link from 'next/link'

type Txn = Database['public']['Tables']['txns']['Row']

export async function Investments(props: { user: string }) {
  const { user } = props
  const supabase = createServerClient()
  const investments: Txn[] = await getIncomingTxnsByUser(supabase, user)
  console.log('investments', investments)
  const bidsDisplay = investments.map((item) => (
    <li key={item.id}>
      {/* @ts-expect-error Server Component */}
      <InvestmentsDisplay
        supabase={supabase}
        project_id={item.token}
        amount={item.amount}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-2xl">Investments</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bidsDisplay}
        </ul>
      </div>
    </div>
  )
}

async function InvestmentsDisplay(props: {
  supabase: SupabaseClient
  project_id: string
  amount: number
}) {
  const { supabase, project_id, amount } = props
  const project = await getProjectById(supabase, project_id)
  return (
    <Link href={`/projects/${project.slug}`} className="block hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
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
              bought&nbsp;<span className="text-black">${amount}</span>
              &nbsp;@&nbsp;
              <span className="text-black">to be gotten</span>&nbsp;valuation
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <p>Closing on</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
