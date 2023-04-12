'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import type { Investment } from './page'
import { formatMoney } from '@/utils/formatting'

export function Investments(props: { investments: Investment[] }) {
  const { investments } = props
  const investmentsDisplay = investments.map((item) =>
    item.project ? (
      <li key={item.project.id}>
        <InvestmentsDisplay
          project={item.project}
          amount={item.price_usd}
          num_shares={item.num_shares}
        />
      </li>
    ) : null
  )
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

function InvestmentsDisplay(props: {
  project: Project
  amount: number
  num_shares: number
}) {
  const { project, amount, num_shares } = props
  if (num_shares == 0) {
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
            <RoundTag roundTitle={project.round} />
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              Bought&nbsp;
              <span className="text-black">{formatMoney(-amount)}</span>
              &nbsp;@&nbsp;
              <span className="text-black">
                {formatMoney((-amount * 10000000) / num_shares)}
              </span>
              &nbsp;valuation
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
