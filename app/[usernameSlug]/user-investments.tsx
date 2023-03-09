import { Project } from '@/db/project'
import { RoundTag } from '@/components/round-tag'
import Link from 'next/link'
import type { investment } from './page'

export async function Investments(props: {
  investments: investment[]
  profile: string
}) {
  const { investments, profile } = props
  const investmentsDisplay = investments.map((item) =>
    item.project ? (
      <li key={item.project.id}>
        {/* @ts-expect-error Server Component */}
        <InvestmentsDisplay
          profile={profile}
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

async function InvestmentsDisplay(props: {
  profile: string
  project: Project
  amount: number
  num_shares: number
}) {
  const { profile, project, amount, num_shares } = props
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
