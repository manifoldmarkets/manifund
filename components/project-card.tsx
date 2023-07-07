'use client'
import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import { FullProject, Project, ProjectTransfer } from '@/db/project'
import Link from 'next/link'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ProgressBar } from './progress-bar'
import { Col } from './layout/col'
import {
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid'
import { orderBy, uniq } from 'lodash'
import { RoundTag, Tag } from './tags'
import { UserAvatarAndBadge } from './user-link'
import { DataBox } from './data-box'
import { Round } from '@/db/round'
import { Card } from './card'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'
import { getSponsoredAmount } from '@/utils/constants'

export function ProjectCard(props: {
  project: FullProject
  creator: Profile
  numComments: number
  bids: Bid[]
  txns: Txn[]
  valuation?: number
  hideRound?: boolean
}) {
  const { creator, project, numComments, bids, txns, valuation, hideRound } =
    props
  const amountRaised = getAmountRaised(project, bids, txns)
  const firstDonorId =
    project.stage === 'proposal'
      ? orderBy(bids, 'created_at', 'asc')[0]?.bidder
      : orderBy(txns, 'created_at', 'asc')[0]?.from_id
  const contributorIds =
    project.stage === 'proposal'
      ? bids.map((bid) => bid.bidder)
      : txns.filter((txn) => txn.token === 'USD').map((txn) => txn.from_id)
  const numContributors = uniq(contributorIds).length
  const regrantorInitiated = getSponsoredAmount(firstDonorId ?? '') > 0
  return (
    <Card className="px-4 pb-2 pt-1">
      <Col className="h-full justify-between">
        <ProjectCardHeader
          round={project.rounds}
          projectType={project.type}
          creator={creator}
          valuation={project.stage !== 'not funded' ? valuation : undefined}
          regrantorInitiated={regrantorInitiated}
          hideRound={hideRound}
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
        </Link>
        <Col className="gap-1">
          {(project.stage === 'proposal' ||
            (project.stage === 'active' &&
              amountRaised < project.funding_goal)) && (
            <Row className="flex-1 items-center gap-1">
              <ProgressBar
                fundingGoal={project.funding_goal}
                minFunding={project.min_funding}
                amountRaised={amountRaised}
              />
              <p className="rounded-xl bg-orange-100 py-0.5 px-1.5 text-center text-sm font-bold text-orange-600">
                {formatMoney(project.funding_goal)}
              </p>
            </Row>
          )}
          <ProjectCardData
            numContributions={numContributors}
            numComments={numComments}
            amountRaised={amountRaised}
            projectSlug={project.slug}
          />
        </Col>
      </Col>
    </Card>
  )
}

function ProjectCardData(props: {
  numComments: number
  numContributions: number
  amountRaised: number
  projectSlug: string
}) {
  const { numComments, numContributions, amountRaised, projectSlug } = props
  return (
    <Row className="justify-between text-sm">
      <Row className="items-center gap-1">
        <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
        <span className="text-gray-400">{formatLargeNumber(amountRaised)}</span>
      </Row>
      {numContributions > 0 && (
        <Row className="items-center gap-1">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">{numContributions}</span>
        </Row>
      )}
      <Link href={`/projects/${projectSlug}#tabs`}>
        <Row className="items-center gap-1">
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">{numComments}</span>
        </Row>
      </Link>
    </Row>
  )
}

export function ProjectCardHeader(props: {
  round: Round
  creator: Profile
  projectType: Project['type']
  projectTransfer?: ProjectTransfer
  valuation?: number
  regrantorInitiated?: boolean
  hideRound?: boolean
}) {
  const {
    round,
    creator,
    valuation,
    projectTransfer,
    projectType,
    regrantorInitiated,
    hideRound,
  } = props
  return (
    <div className="flex justify-between">
      <div className="mt-1">
        {!hideRound && (
          <RoundTag roundTitle={round.title} roundSlug={round.slug} />
        )}
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
      {projectType === 'cert' && valuation && !isNaN(valuation) ? (
        <div className="relative top-1">
          <DataBox value={`${formatMoney(valuation)}`} label={'valuation'} />
        </div>
      ) : null}
      {projectType === 'grant' && regrantorInitiated && (
        <Tooltip text="Regrantor initiated">
          <CheckBadgeIcon className="relative top-1 h-6 w-6 text-orange-500" />
        </Tooltip>
      )}
    </div>
  )
}
