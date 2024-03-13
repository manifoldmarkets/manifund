'use client'
import { DonateBox } from '@/components/donate-box'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProgressBar } from '@/components/progress-bar'
import { BidAndProfile, BidAndProject } from '@/db/bid'
import { CommentAndProfile } from '@/db/comment'
import { Profile } from '@/db/profile'
import { FullProject, Project } from '@/db/project'
import { Cause, SimpleCause } from '@/db/cause'
import { TxnAndProfiles, TxnAndProject } from '@/db/txn'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
  getActiveValuation,
  getAmountRaised,
  getMinIncludingAmm,
  getProposalValuation,
} from '@/utils/math'
import { useState } from 'react'
import { ProjectTabs } from './project-tabs'
import { ProjectData } from './project-data'
import { ProposalRequirements } from './proposal-requirements'
import { Vote } from './vote'
import { CauseTag } from '@/components/tags'
import { Trade } from './trade'
import { AssuranceBuyBox } from './assurance-buy-box'
import { calculateTradePoints } from '@/utils/amm'
import { CertValuationChart } from './valuation-chart'
import { RichContent } from '@/components/editor'
import { CreatorActionPanel } from './creator-action-panel'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Tooltip } from '@/components/tooltip'
import { EnvelopeIcon } from '@heroicons/react/20/solid'
import { ViewerActionPanel } from './viewer-action-panel'
import { differenceInDays, differenceInHours } from 'date-fns'
import { toSentenceCase } from '@/utils/formatting'

export function ProjectDisplay(props: {
  project: FullProject
  userTxns: TxnAndProject[]
  userBids: BidAndProject[]
  comments: CommentAndProfile[]
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
  causesList: SimpleCause[]
  prizeCause?: Cause
  userProfile?: Profile
  creatorEmail?: string
  userIsAdmin?: boolean
}) {
  const {
    project,
    userTxns,
    userBids,
    comments,
    projectBids,
    projectTxns,
    userProfile,
    creatorEmail,
    causesList,
    prizeCause,
    userIsAdmin,
  } = props
  const userSpendableFunds = Math.max(
    userProfile
      ? project.type === 'cert' && userProfile.id === project.creator
        ? calculateCashBalance(
            userTxns,
            userBids,
            userProfile.id,
            userProfile.accreditation_status
          )
        : calculateCharityBalance(
            userTxns,
            userBids,
            userProfile.id,
            userProfile.accreditation_status
          )
      : 0,
    0
  )
  const userSellableShares = userProfile
    ? calculateSellableShares(userTxns, userBids, project.id, userProfile.id)
    : 0
  const valuation =
    project.type === 'grant'
      ? project.funding_goal
      : project.stage === 'proposal'
      ? getProposalValuation(project)
      : getActiveValuation(
          projectTxns,
          project.id,
          getProposalValuation(project)
        )
  const isOwnProject = userProfile?.id === project.profiles.id
  const pendingProjectTransfers = project.project_transfers?.filter(
    (projectTransfer) => !projectTransfer.transferred
  )
  const userIsFollower =
    !!userProfile &&
    !!project.project_follows.find(
      (follow) => follow.follower_id === userProfile.id
    )
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
  const minIncludingAmm = getMinIncludingAmm(project)
  const tradePoints = calculateTradePoints(projectTxns, project.id)
  const activeAuction =
    !!prizeCause?.cert_params?.auction && project.stage === 'proposal'
  const [specialCommentPrompt, setSpecialCommentPrompt] = useState<
    undefined | string
  >(undefined)
  return (
    <>
      {project.stage === 'proposal' && pendingProjectTransfers.length === 0 && (
        <ProposalRequirements
          signedAgreement={project.signed_agreement}
          approved={project.approved === true}
          reachedMinFunding={amountRaised >= minIncludingAmm}
          projectSlug={project.slug}
        />
      )}
      <Col className="gap-2">
        <Col className="gap-1">
          <Row className="flex-2 items-center gap-3">
            <Vote
              projectId={project.id}
              userId={userProfile?.id}
              votes={project.project_votes}
              setCommentPrompt={setSpecialCommentPrompt}
            />
            <Col>
              <h2 className="text-lg font-bold leading-tight text-gray-900 sm:text-2xl">
                {project.title}
              </h2>
            </Col>
          </Row>
          <Row className="mb-1 flex-wrap gap-1">
            {project.causes?.map((cause) => (
              <CauseTag
                key={cause.slug}
                causeTitle={cause.title}
                causeSlug={cause.slug}
              />
            ))}
          </Row>
        </Col>
        <div className="flex flex-col-reverse gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <Row className="items-center gap-1 text-sm text-gray-700">
            <UserAvatarAndBadge profile={project.profiles} />
            {creatorEmail && (
              <Tooltip text="Copy creator email">
                <EnvelopeIcon
                  className="h-4 w-4 cursor-pointer stroke-2 hover:text-gray-800"
                  onClick={async () => {
                    await navigator.clipboard.writeText(creatorEmail)
                  }}
                />
              </Tooltip>
            )}
            {pendingProjectTransfers.length > 0 && (
              <span className="text-gray-500">
                pending transfer to {pendingProjectTransfers[0].recipient_name}
              </span>
            )}
          </Row>
          <Row className="justify-between gap-2">
            {userProfile && !isOwnProject && (
              <ViewerActionPanel
                projectId={project.id}
                projectSlug={project.slug}
                currentlyFollowing={userIsFollower}
              />
            )}
            {(isOwnProject || userIsAdmin) && (
              <CreatorActionPanel
                project={project}
                causesList={causesList}
                prizeCause={prizeCause}
              />
            )}
          </Row>
        </div>
        <Col className="mb-4 gap-6 border-y border-gray-200 py-6">
          <ProjectTypeDisplay type={project.type} stage={project.stage} />
          <div>
            {(project.stage === 'proposal' ||
              (project.stage === 'active' && project.type === 'grant')) && (
              <ProgressBar
                amountRaised={amountRaised}
                minFunding={minIncludingAmm}
                fundingGoal={project.funding_goal}
              />
            )}
            <ProjectData
              minimum={minIncludingAmm}
              valuation={valuation}
              project={project}
              raised={amountRaised}
            />
          </div>
          {!['draft', 'proposal'].includes(project.stage) &&
            project.type === 'cert' &&
            !!project.amm_shares && (
              <CertValuationChart
                tradePoints={tradePoints}
                ammTxns={projectTxns.filter(
                  (txn) =>
                    txn.to_id === project.id || txn.from_id === project.id
                )}
                ammId={project.id}
                size="lg"
              />
            )}
          {project.type === 'cert' && project.stage === 'active' && (
            <Trade
              ammTxns={
                !!project.amm_shares
                  ? projectTxns.filter(
                      (txn) =>
                        txn.to_id === project.id || txn.from_id === project.id
                    )
                  : undefined
              }
              projectId={project.id}
              userSpendableFunds={userSpendableFunds}
              userSellableShares={userSellableShares}
              signedIn={!!userProfile}
            />
          )}
          {userProfile?.id !== project.creator &&
            project.type === 'cert' &&
            project.stage === 'proposal' && (
              <AssuranceBuyBox
                project={project}
                minValuation={valuation}
                offerSizePortion={
                  (activeAuction
                    ? minIncludingAmm
                    : minIncludingAmm - amountRaised) / valuation
                }
                maxBuy={userSpendableFunds}
                activeAuction={activeAuction}
                signedIn={!!userProfile}
              />
            )}
          {userProfile?.id !== project.creator &&
            project.type === 'grant' &&
            pendingProjectTransfers.length === 0 &&
            (project.stage === 'proposal' || project.stage === 'active') && (
              <>
                {amountRaised < project.funding_goal ? (
                  <DonateBox
                    project={project}
                    profile={userProfile}
                    maxDonation={userSpendableFunds}
                    setCommentPrompt={setSpecialCommentPrompt}
                  />
                ) : (
                  <span className="mx-auto mb-5 text-sm italic text-gray-500">
                    Fully funded and not currently accepting donations.
                  </span>
                )}
              </>
            )}
        </Col>
        {project.description && (
          <RichContent content={project.description} className="px-3 text-sm" />
        )}
        <div id="tabs">
          <ProjectTabs
            project={project}
            userProfile={userProfile}
            comments={comments}
            bids={projectBids}
            txns={projectTxns}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
            specialCommentPrompt={specialCommentPrompt}
            activeAuction={activeAuction}
          />
        </div>
      </Col>
    </>
  )
}

export function TimeLeftDisplay(props: { closeDate: string }) {
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${props.closeDate}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = differenceInDays(closeDate, now)
  const hoursLeft = daysLeft < 1 ? differenceInHours(closeDate, now) : 0
  return (
    <Row className="items-center gap-1 text-sm text-gray-900">
      <span className="font-semibold">{`${Math.max(
        hoursLeft ? hoursLeft : daysLeft,
        0
      )} ${hoursLeft ? 'hours' : 'days'}`}</span>
      <span>left to contribute</span>
    </Row>
  )
}

export function scrollToComments(router: any) {
  router.push('?tab=comments')
  const tabsElement = document.getElementById('tabs')
  tabsElement?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'start',
  })
}

export function ProjectTypeDisplay(props: {
  type: Project['type']
  stage: Project['stage']
}) {
  const { type, stage } = props
  const typeToLabelMap = {
    cert: 'Impact certificate',
    grant: 'Grant',
    dummy: 'Uninteractable stand in',
  }
  return (
    <Row className="justify-between">
      <SmallDescriptionPoint label="stage" value={toSentenceCase(stage)} />
      <SmallDescriptionPoint label="type" value={typeToLabelMap[type]} />
    </Row>
  )
}

function SmallDescriptionPoint(props: { label: string; value: string }) {
  const { label, value } = props
  return (
    <div className="px-4 sm:px-0">
      <dt className="text-sm leading-6 text-gray-700">{label}</dt>
      <dd className="text-sm font-medium leading-6 text-gray-900">{value}</dd>
    </div>
  )
}
