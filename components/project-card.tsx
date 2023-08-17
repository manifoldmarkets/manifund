'use client'
import { Profile } from '@/db/profile'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import { FullProject, Project, ProjectTransfer } from '@/db/project'
import Link from 'next/link'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { ProgressBar } from './progress-bar'
import { Col } from './layout/col'
import {
  ChatBubbleLeftEllipsisIcon,
  ChevronUpDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/20/solid'
import { orderBy } from 'lodash'
import { Tag, TopicTag } from './tags'
import { UserAvatarAndBadge } from './user-link'
import { Card } from './card'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import { getSponsoredAmount } from '@/utils/constants'
import { Topic } from '@/db/topic'

export function ProjectCard(props: {
  project: FullProject
  topics: Topic[]
  valuation?: number
  creatorEmail?: string
}) {
  const { project, topics, valuation } = props
  const amountRaised = getAmountRaised(project, project.bids, project.txns)
  const firstDonorId =
    project.stage === 'proposal'
      ? orderBy(project.bids, 'created_at', 'asc')[0]?.bidder
      : orderBy(project.txns, 'created_at', 'asc')[0]?.from_id
  const regrantorInitiated = getSponsoredAmount(firstDonorId ?? '') > 0
  const voteCount = project.project_votes.reduce(
    (acc, vote) => vote.magnitude + acc,
    0
  )
  return (
    <Card className="px-4 pb-2 pt-1">
      <Col className="h-full justify-between">
        <ProjectCardHeader
          projectType={project.type}
          creator={project.profiles}
          valuation={project.stage !== 'not funded' ? valuation : undefined}
          regrantorInitiated={regrantorInitiated}
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
        <Row className="mb-1 flex-wrap gap-1">
          {topics?.map((topic) => (
            <TopicTag
              key={topic.slug}
              topicTitle={topic.title}
              topicSlug={topic.slug}
            />
          ))}
        </Row>
        <Col>
          {(project.stage === 'proposal' ||
            (project.stage === 'active' &&
              amountRaised < project.funding_goal)) && (
            <Row className="flex-1 items-center gap-1">
              <ProgressBar
                fundingGoal={project.funding_goal}
                minFunding={project.min_funding}
                amountRaised={amountRaised}
                small
              />
              <p className="rounded-2xl bg-orange-100 py-1 px-2 text-center text-sm font-medium text-orange-600">
                {formatMoney(project.funding_goal)}
              </p>
            </Row>
          )}
          <ProjectCardData
            voteCount={voteCount}
            numComments={project.comments.length}
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
  creator: Profile
  projectType: Project['type']
  projectTransfer?: ProjectTransfer
  valuation?: number
  regrantorInitiated?: boolean
  hideRound?: boolean
  creatorEmail?: string
}) {
  const {
    creator,
    valuation,
    projectTransfer,
    projectType,
    regrantorInitiated,
    creatorEmail,
  } = props
  return (
    <Row className="mt-1 items-start justify-between">
      <div>
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
          <p className="rounded-2xl bg-orange-100 py-1 px-2 text-center text-sm font-medium text-orange-600">
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

export function CardlessProject(props: { project: FullProject }) {
  const { project } = props
  return (
    <Col className="items-start justify-between gap-3 rounded p-3 hover:bg-gray-100">
      <Row className="flex-2 w-full items-center justify-between gap-3 text-xs">
        <UserAvatarAndBadge
          profile={project.profiles}
          className="text-sm text-gray-600"
        />
        <Row className="flex-1 items-center gap-3">
          <ProgressBar
            amountRaised={getAmountRaised(project, project.bids, project.txns)}
            fundingGoal={project.funding_goal}
            minFunding={project.min_funding}
            small
          />
          <span className="relative z-10 rounded-full bg-orange-100 px-3 py-1.5 font-medium text-orange-600">
            {formatMoney(project.funding_goal)}
          </span>
        </Row>
      </Row>
      <Link href={`/projects/${project.slug}`}>
        <h3 className="tracking-0 font-semibold leading-6 text-gray-900">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-5 text-gray-600 lg:line-clamp-2">
          {project.blurb}
        </p>
      </Link>
    </Col>
  )
}
