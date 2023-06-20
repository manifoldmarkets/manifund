'use client'
import { Project } from '@/db/project'
import { RoundTag } from '@/components/tags'
import Link from 'next/link'
import { formatMoney } from '@/utils/formatting'
import { Investment } from './profile-tabs'

export function Investments(props: { investments: Investment[] }) {
  const { investments } = props
  const investmentsDisplay = investments
    .filter((investment) => investment.numShares !== 0 && investment.project)
    .map((investment) =>
      investment.project ? (
        <Link
          href={`/projects/${investment.project.slug}/?tab=shareholders`}
          className="table-row w-full"
          key={investment.project.id}
        >
          <td className="p-4">{investment.project.title}</td>
          <td className="py-4">
            <p className="flex items-center text-sm text-gray-500">
              bought&nbsp;
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
          </td>
          <td className="hidden p-4 text-right text-sm text-gray-500 sm:block">
            <RoundTag roundTitle={investment.project.round} />
          </td>
        </Link>
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
