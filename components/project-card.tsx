import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatDate, formatLargeNumber } from '@/utils/formatting'
import {
  getProposalValuation,
  getActiveValuation,
  getPercentFunded,
} from '@/utils/math'
import { Project } from '@/db/project'
import Link from 'next/link'
import { CalendarIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ProjectCardHeader } from './project-card-header'
import { ProgressBar } from './progress-bar'
import { Col } from './layout/col'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { orderBy } from 'lodash'
import { formatDistanceToNow } from 'date-fns'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  numComments: number
  bids: Bid[]
  txns: Txn[]
}) {
  const { creator, project, numComments, bids, txns } = props
  const valuation =
    project.stage == 'proposal'
      ? formatLargeNumber(getProposalValuation(project))
      : formatLargeNumber(
          getActiveValuation(txns, getProposalValuation(project))
        )
  return (
    <Col className="rounded-md border border-gray-200 bg-white px-4 pb-2 pt-1 shadow hover:bg-gray-100">
      <ProjectCardHeader
        round={project.round}
        creator={creator}
        valuation={project.stage !== 'not funded' ? valuation : undefined}
      />
      <Link
        href={`projects/${project.slug}`}
        className="group flex flex-1 flex-col justify-between hover:cursor-pointer"
      >
        <div className="mt-2 mb-4">
          <h1 className="text-xl font-semibold group-hover:underline">
            {project.title}
          </h1>
          <p className="font-light text-gray-500">{project.blurb}</p>
        </div>
        <ProjectCardFooter
          project={project}
          numComments={numComments}
          bids={bids}
          txns={txns}
        />
      </Link>
    </Col>
  )
}

function ProjectCardFooter(props: {
  project: Project
  numComments: number
  bids: Bid[]
  txns: Txn[]
}) {
  const { project, numComments, bids, txns } = props
  let percentRaised = Math.min(getPercentFunded(bids, project.min_funding), 100)
  switch (project.stage) {
    case 'proposal':
      return (
        <div>
          <div className="flex justify-between">
            <div className="flex flex-col">
              {project.round !== 'ACX Mini-Grants' && (
                <span className="mb-1 text-gray-600">
                  <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
                  Auction closes{' '}
                  <span className="text-black">
                    {formatDate(project.auction_close)}
                  </span>
                </span>
              )}

              <span className="mb-1 flex gap-1 text-gray-600">
                <SparklesIcon
                  className={clsx(
                    'h-6 w-6 ',
                    percentRaised >= 0.005 ? 'text-orange-500' : 'text-gray-400'
                  )}
                />
                <span className="text-black">
                  {formatLargeNumber(percentRaised)}%
                </span>
                raised
              </span>
            </div>
            {numComments > 0 && (
              <div className="flex flex-row items-center gap-2">
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-500">{numComments}</span>
              </div>
            )}
          </div>
          <ProgressBar percent={percentRaised} />
        </div>
      )
    case 'active':
      const sortedTxns = orderBy(txns, 'created_at', 'desc')
      const lastTraded = new Date(sortedTxns[0].created_at)
      return (
        <div className="flex justify-between">
          {lastTraded && (
            <span className="mb-1 text-gray-600">
              <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
              Last traded{' '}
              <span className="text-black">
                {formatDistanceToNow(lastTraded, {
                  addSuffix: true,
                })}
              </span>
            </span>
          )}
          {numComments > 0 && (
            <div className="flex flex-row items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500">{numComments}</span>
            </div>
          )}
        </div>
      )
    default:
      return (
        <div className="flex justify-end">
          {numComments > 0 && (
            <div className="flex flex-row items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500">{numComments}</span>
            </div>
          )}
        </div>
      )
  }
}
