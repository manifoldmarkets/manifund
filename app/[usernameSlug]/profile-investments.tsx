'use client'
import Link from 'next/link'
import { formatMoney } from '@/utils/formatting'
import { Investment } from './profile-content'

export function Investments(props: { investments: Investment[] }) {
  const { investments } = props
  const investmentsDisplay = investments
    .filter((investment) => investment.numShares !== 0 && investment.project)
    .map((investment) => {
      const priceText = (
        <span className="flex items-center text-sm font-normal text-gray-500">
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
        </span>
      )
      return investment.project ? (
        <Link
          href={`/projects/${investment.project.slug}/?tab=shareholders`}
          className="table-row w-full"
          key={investment.project.id}
        >
          <td className="p-4 font-medium">
            {investment.project.title}
            <div className="mt-2 lg:hidden">{priceText}</div>
          </td>
          <td className="hidden py-4 lg:table-cell">{priceText}</td>
        </Link>
      ) : null
    })
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">Investments</h1>
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
