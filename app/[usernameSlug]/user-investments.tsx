'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import type { Investment } from './page'
import { formatMoney } from '@/utils/formatting'

export function Investments(props: { investments: Investment[] }) {
  const { investments } = props
  const investmentsDisplay = investments
    .filter((investment) => investment.num_shares !== 0 && investment.project)
    .map((investment) =>
      investment.project ? (
        <li key={investment.project.id}>
          <InvestmentsDisplay
            project={investment.project}
            amount={investment.price_usd}
            numShares={investment.num_shares}
          />
        </li>
      ) : null
    )
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Investments</h1>
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
  numShares: number
}) {
  const { project, amount, numShares } = props
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
                {formatMoney((-amount * 10000000) / numShares)}
              </span>
              &nbsp;valuation
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
