'use client'
import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatDate, formatLargeNumber, formatMoney } from '@/utils/formatting'
import { getPercentRaised } from '@/utils/math'
import { FullProject, Project, ProjectTransfer } from '@/db/project'
import Link from 'next/link'
import { CalendarIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ProgressBar } from './progress-bar'
import { Col } from './layout/col'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { orderBy } from 'lodash'
import { formatDistanceToNow } from 'date-fns'
import { RoundTag, Tag } from './tags'
import { UserAvatarAndBadge } from './user-link'
import { DataBox } from './data-box'
import { Round } from '@/db/round'
import { Card } from './card'
import { Row } from './layout/row'

export function ProjectCard(props: {
  project: FullProject
  creator: Profile
  numComments: number
  bids: Bid[]
  txns: Txn[]
  valuation: number
}) {
  const { creator, project, numComments, bids, txns, valuation } = props
  const percentRaised = getPercentRaised(bids, project)
  return (
    <Card className="px-4 pb-2 pt-1">
      <Col className="h-full justify-between">
        <ProjectCardHeader
          round={project.rounds}
          projectType={project.type}
          creator={creator}
          valuation={project.stage !== 'not funded' ? valuation : undefined}
        />
        <Link
          href={`/projects/${project.slug}`}
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
            percentRaised={percentRaised}
            txns={txns}
          />
        </Link>
      </Col>
    </Card>
  )
}

function ProjectCardFooter(props: {
  project: Project
  numComments: number
  percentRaised: number
  txns: Txn[]
}) {
  const { project, numComments, percentRaised, txns } = props
  switch (project.stage) {
    case 'proposal':
      return (
        <div>
          <div className="flex justify-between">
            <div className="flex flex-col">
              {project.auction_close && (
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
      const lastTraded = new Date(
        sortedTxns.length > 0 ? sortedTxns[0].created_at : 0
      )
      return (
        <div className="flex justify-between">
          {sortedTxns.length > 0 && (
            <span className="mb-1 text-gray-600">
              <CalendarIcon className="relative bottom-0.5 mr-1 inline h-6 w-6 text-orange-500" />
              {project.type === 'cert' ? 'Last traded' : 'Last donation'}{' '}
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
  projectType: Project['type']
  projectTransfer?: ProjectTransfer
  valuation?: number
}) {
  const { round, creator, valuation, projectTransfer, projectType } = props
  return (
    <div className="flex justify-between">
      <div className="mt-1">
        <RoundTag roundTitle={round.title} roundSlug={round.slug} />
        <div className="h-1" />
        <UserAvatarAndBadge profile={creator} />
        {projectTransfer && (
          <Row className="gap-1">
            <Tag text={'PENDING TRANSFER'} className="mt-1" color="orange" />
            <Col className="relative top-0.5 justify-center text-sm text-gray-500">
              to {projectTransfer.recipient_name}
            </Col>
          </Row>
        )}
      </div>
      {valuation && !isNaN(valuation) ? (
        <div className="relative top-1">
          <DataBox
            value={`${formatMoney(valuation)}`}
            label={projectType === 'cert' ? 'valuation' : 'raising'}
          />
        </div>
      ) : null}
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
  const percentRaised = getPercentRaised(bids, project)
  return (
    <Card className="flex w-60 max-w-min flex-col justify-between overflow-visible pb-2 pt-1">
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
        <div className="mb-1 flex justify-between gap-5">
          <UserAvatarAndBadge profile={creator} short />
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
    </Card>
  )
}
