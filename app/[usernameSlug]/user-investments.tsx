'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { formatMoney } from '@/utils/formatting'
import { Investment } from './profile-tabs'
import { TableRow } from '@/components/user-bids'

export function Investments(props: { investments: Investment[] }) {
  const { investments } = props
  const investmentsDisplay = investments
    .filter((investment) => investment.numShares !== 0 && investment.project)
    .map((investment) =>
      investment.project ? (
        <TableRow
          key={investment.project.id}
          title={investment.project.title}
          subtitle={
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                Bought&nbsp;
                <span className="text-black">
                  {formatMoney(-investment.priceUsd)}
                </span>
                &nbsp;@&nbsp;
                <span className="text-black">
                  {formatMoney(
                    (-investment.priceUsd * 10000000) / investment.numShares
                  )}
                </span>
                &nbsp;valuation
              </p>
            </div>
          }
          tag={<RoundTag roundTitle={investment.project.round} />}
          href={`/projects/${investment.project.slug}/?tab=shareholders`}
        />
      ) : null
    )
  return (
    <div>
      <h1 className="text-xl sm:text-2xl">Investments</h1>
      <div className="overflow-hidden rounded-md bg-white shadow">
        <table
          role="list"
          className="w-full divide-y divide-gray-200 rounded-md bg-white shadow"
        >
          {investmentsDisplay}
        </table>
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
    <Link
      href={`/projects/${project.slug}/?tab=shareholders`}
      className="block hover:bg-gray-50"
    >
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
