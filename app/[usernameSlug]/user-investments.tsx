import { SupabaseClient } from '@supabase/supabase-js'
import { getProjectById } from '@/db/project'
import { RoundTag } from '@/components/round-tag'
import Link from 'next/link'
import type { investment } from './page'

export async function Investments(props: {
  supabase: SupabaseClient
  investments: investment[]
  profile: string
}) {
  const { supabase, investments, profile } = props
  const investmentsDisplay = investments.map((item) => (
    <li key={item.project_id}>
      {/* @ts-expect-error Server Component */}
      <InvestmentsDisplay
        supabase={supabase}
        profile={profile}
        project_id={item.project_id}
        amount={item.price_usd}
        num_shares={item.num_shares}
      />
    </li>
  ))
  return (
    <div>
      <h1 className="text-2xl">Investments</h1>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {investmentsDisplay}
        </ul>
      </div>
    </div>
  )
}

async function InvestmentsDisplay(props: {
  supabase: SupabaseClient
  profile: string
  project_id: string
  amount: number
  num_shares: number
}) {
  const { supabase, profile, project_id, amount, num_shares } = props
  if (num_shares == 0) {
    return <div className="hidden"></div>
  }
  const project = await getProjectById(supabase, project_id)
  if (project.creator == profile) {
    return <div className="hidden"></div>
  }
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
              bought&nbsp;<span className="text-black">${-amount}</span>
              &nbsp;@&nbsp;
              <span className="text-black">
                ${(-amount * 10000000) / num_shares}
              </span>
              &nbsp;valuation
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
