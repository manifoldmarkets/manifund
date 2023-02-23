import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatDate, formatLargeNumber } from '@/utils/formatting'
import { getProposalValuation, getActiveValuation } from '@/utils/math'

import { Project } from '@/db/project'
import Link from 'next/link'
import {
  EllipsisHorizontalCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ProjectCardHeader } from './project-card-header'
import { ProgressBar } from './progress-bar'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
  txns: Txn[]
}) {
  const { creator, project, bids, txns } = props
  const valuation =
    project.stage == 'proposal'
      ? getProposalValuation(project)
      : formatLargeNumber(getActiveValuation(txns, project.founder_portion))
  return (
    <Link
      className="flex flex-col justify-between rounded-md border border-gray-200 bg-white px-4 pb-2 pt-1 shadow hover:cursor-pointer hover:bg-gray-100"
      href={`projects/${project.slug}`}
    >
      <div>
        <ProjectCardHeader
          round={project.round}
          creator={creator}
          valuation={valuation}
        />
        <h1 className="mt-2 text-xl font-bold">{project.title}</h1>
        <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      </div>
      <ProjectCardFooter project={project} bids={bids} />
    </Link>
  )
}

function ProjectCardFooter(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  const raised = bids.reduce((acc, bid) => acc + bid.amount, 0)
  const percentRaised =
    raised / project.min_funding > 1 ? 1 : raised / project.min_funding
  switch (project.stage) {
    case 'proposal':
      return (
        <div className="bottom">
          <div className="flex flex-col justify-between md:flex-row lg:flex-col">
            <span className="mb-1 flex gap-1 text-gray-600">
              <CalendarIcon className="h-6 w-6 text-orange-500" />
              Auction closes
              <span className="text-black">
                {formatDate(project.auction_close)}
              </span>
            </span>
            <span className="mb-1 flex gap-1 text-gray-600">
              <EllipsisHorizontalCircleIcon className="h-6 w-6 text-orange-500" />
              <span className="text-black">{percentRaised * 100}%</span>raised
            </span>
          </div>
          <ProgressBar percent={percentRaised} />
        </div>
      )
    default:
      return <div></div>
  }
}
