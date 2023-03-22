'use client'
import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatDate, formatLargeNumber } from '@/utils/formatting'
import {
  getProposalValuation,
  getActiveValuation,
  getPercentFunded,
} from '@/utils/math'
import { FullProject, Project } from '@/db/project'
import Link from 'next/link'
import { CalendarIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ProgressBar } from './progress-bar'
import { Col } from './layout/col'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { orderBy } from 'lodash'
import { formatDistanceToNow } from 'date-fns'
import { RoundTag } from './round-tag'
import { UserAvatarAndBadge } from './user-link'
import { ValuationBox } from './valuation-box'
import { Round } from '@/db/round'

export function ProjectCard(props: {
  project: FullProject
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
    <Col
      className={clsx(
        'rounded-md border border-gray-200 bg-white px-4 pb-2 pt-1 shadow'
      )}
    >
      <ProjectCardHeader
        round={project.rounds}
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
  const percentRaised = Math.min(
    getPercentFunded(bids, project.min_funding),
    100
  )
  switch (project.stage) {
    case 'proposal':
      return (
        <div>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <span className="mb-1 text-gray-600">
                <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
                Auction closes{' '}
                <span className="text-black">
                  {formatDate(project.auction_close)}
                </span>
              </span>

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

export function ProjectCardHeader(props: {
  round: Round
  creator: Profile
  valuation?: string
}) {
  const { round, creator, valuation } = props
  return (
    <div className="flex justify-between">
      <div className="mt-1">
        <RoundTag roundTitle={round.title} />
        <div className="h-1" />
        <UserAvatarAndBadge profile={creator} />
      </div>
      {valuation && (
        <div className="relative top-1">
          <ValuationBox valuation={valuation} />
        </div>
      )}
    </div>
  )
}

export function SimpleProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
  numComments: number
}) {
  const { project, creator, bids, numComments } = props
  const percentRaised = Math.min(
    getPercentFunded(bids, project.min_funding),
    100
  )
  return (
    <Col
      className={clsx(
        'w-60 max-w-min rounded-md border border-gray-200 bg-white px-4 pb-2 pt-1 shadow'
      )}
    >
      <Link
        href={`projects/${project.slug}`}
        className=" group flex min-w-full flex-1 flex-col justify-between hover:cursor-pointer"
      >
        <div className="mt-2 mb-4">
          <h1 className="text-lg font-semibold line-clamp-3 group-hover:underline">
            {project.title}
          </h1>
          <p className="font-light text-gray-500 line-clamp-3">
            {project.blurb}
          </p>
        </div>
      </Link>
      <Col>
        <div className="flex justify-between gap-1">
          <UserAvatarAndBadge profile={creator} />
          {numComments > 0 ? (
            <div className="flex flex-row items-center gap-1">
              <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500">{numComments}</span>
            </div>
          ) : (
            <div className="w-16" />
          )}
        </div>
        {project.stage === 'proposal' && (
          <ProgressBar percent={percentRaised} />
        )}
      </Col>
    </Col>
  )
}
