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
  ChevronUpDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/20/solid'
import { orderBy } from 'lodash'
import { RoundTag, Tag } from './tags'
import { UserAvatarAndBadge } from './user-link'
import { Round } from '@/db/round'
import { Card } from './card'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import { getSponsoredAmount } from '@/utils/constants'
import { Avatar } from './avatar'

export function ProjectCard(props: {
  project: FullProject
  creator: Profile
  numComments: number
  bids: Bid[]
  txns: Txn[]
  valuation?: number
  hideRound?: boolean
  creatorEmail?: string
}) {
  const { creator, project, numComments, bids, txns, valuation, hideRound } =
    props
  const amountRaised = getAmountRaised(project, bids, txns)
  const firstDonorId =
    project.stage === 'proposal'
      ? orderBy(bids, 'created_at', 'asc')[0]?.bidder
      : orderBy(txns, 'created_at', 'asc')[0]?.from_id
  const regrantorInitiated = getSponsoredAmount(firstDonorId ?? '') > 0
  const voteCount = project.project_votes.reduce(
    (acc, vote) => vote.magnitude + acc,
    0
  )
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
          className="group flex h-full flex-col justify-start gap-1 py-2 hover:cursor-pointer"
        >
          <h1 className="text-xl font-semibold group-hover:underline">
            {project.title}
          </h1>
          <p className="text-sm font-light text-gray-500">{project.blurb}</p>
        </Link>
        <Col>
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
            voteCount={voteCount}
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
  voteCount: number
  amountRaised: number
  projectSlug: string
}) {
  const { numComments, voteCount, amountRaised, projectSlug } = props
  return (
    <div className="grid grid-cols-3 text-sm text-gray-400">
      <Row className="items-center justify-start gap-0">
        <ChevronUpDownIcon className="h-4 w-4 stroke-2" />
        <span>{voteCount}</span>
      </Row>
      <Link href={`/projects/${projectSlug}#tabs`}>
        <Row className="items-center justify-center gap-1">
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 stroke-2" />
          <span>{numComments}</span>
        </Row>
      </Link>
      <Row className="items-center justify-end gap-0.5">
        <CurrencyDollarIcon className="h-4 w-4 stroke-2" />
        <span>{formatLargeNumber(amountRaised)}</span>
      </Row>
    </div>
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
  creatorEmail?: string
}) {
  const {
    round,
    creator,
    valuation,
    projectTransfer,
    projectType,
    regrantorInitiated,
    hideRound,
    creatorEmail,
  } = props
  return (
    <Row className="mt-1 items-start justify-between">
      <div>
        {!hideRound && (
          <RoundTag roundTitle={round.title} roundSlug={round.slug} />
        )}
        <div className="h-1" />
        <Row className="items-center gap-1">
          <UserAvatarAndBadge profile={creator} />
          {creatorEmail && (
            <Tooltip text="Copy creator email">
              <EnvelopeIcon
                className="relative h-4 w-4 cursor-pointer stroke-2 text-orange-600"
                onClick={async () => {
                  await navigator.clipboard.writeText(creatorEmail)
                }}
              />
            </Tooltip>
          )}
        </Row>
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
        <Tooltip text="valuation">
          <p className="relative rounded-xl bg-orange-100 py-0.5 px-1.5 text-center text-sm font-bold text-orange-600">
            {formatMoney(valuation)}
          </p>
        </Tooltip>
      ) : null}
      {projectType === 'grant' && regrantorInitiated && (
        <Tooltip text="Regrantor initiated">
          <CheckBadgeIcon className="relative h-6 w-6 text-orange-500" />
        </Tooltip>
      )}
    </Row>
  )
}

export function MiniProjectCard(props: { project: FullProject }) {
  const { project } = props
  const voteCount = project.project_votes.reduce(
    (acc, vote) => vote.magnitude + acc,
    0
  )
  const amountRaised = getAmountRaised(project, project.bids, project.txns)
  return (
    <Card className="pb-2">
      <div className="flex h-full flex-row justify-between gap-3 lg:flex-col">
        <Col className="justify-center lg:hidden">
          <Avatar
            username={project.profiles.username}
            avatarUrl={project.profiles.avatar_url}
            className="lg:hidden"
            size="sm"
          />
        </Col>
        <UserAvatarAndBadge
          profile={project.profiles}
          className="hidden lg:flex"
        />
        <div>
          <Link
            href={`/projects/${project.slug}`}
            className="group flex flex-col hover:cursor-pointer"
          >
            <h1 className="text-lg font-semibold group-hover:underline">
              {project.title}
            </h1>
            <p className="text-sm font-light text-gray-500">{project.blurb}</p>
          </Link>
          <Col>
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
          </Col>
          <ProjectCardData
            voteCount={voteCount}
            numComments={project.comments.length}
            amountRaised={amountRaised}
            projectSlug={project.slug}
          />
        </div>
      </div>
    </Card>
  )
}
