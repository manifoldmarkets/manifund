'use client'
import { Divider } from '@/components/divider'
import { DonateBox } from '@/components/donate-box'
import { Json } from '@/db/database.types'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProgressBar } from '@/components/progress-bar'
import { ProjectCardHeader } from '@/components/project-card'
import { SignInButton } from '@/components/sign-in-button'
import { BidAndProfile, BidAndProject } from '@/db/bid'
import { CommentAndProfile } from '@/db/comment'
import { Profile } from '@/db/profile'
import { FullProject } from '@/db/project'
import { MiniCause } from '@/db/cause'
import { TxnAndProfiles, TxnAndProject } from '@/db/txn'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import { useState } from 'react'
import { Description } from './description'
import { Edit } from './edit'
import { ProjectTabs } from './project-tabs'
import { ProjectData } from './project-data'
import { ProposalRequirements } from './proposal-requirements'
import { Vote } from './vote'
import { CauseTag } from '@/components/tags'
import { Trade } from './trade'
import { AssuranceBuyBox } from './assurance-buy-box'
import { calculateTradePoints } from '@/utils/amm'
import { CertValuationChart } from './valuation-chart'

export function ProjectDisplay(props: {
  project: FullProject
  userTxns: TxnAndProject[]
  userBids: BidAndProject[]
  comments: CommentAndProfile[]
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
  causesList: MiniCause[]
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
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
  const tradePoints = calculateTradePoints(projectTxns, project.id)
  const [specialCommentPrompt, setSpecialCommentPrompt] = useState<
    undefined | string
  >(undefined)
  return (
    <>
      {project.type === 'grant' &&
        project.stage === 'proposal' &&
        pendingProjectTransfers.length === 0 && (
          <ProposalRequirements
            signedAgreement={project.signed_agreement}
            approved={project.approved === true}
            reachedMinFunding={amountRaised >= project.min_funding}
            projectSlug={project.slug}
          />
        )}
      <Col className="gap-4 px-3">
        <ProjectCardHeader
          projectType={project.type}
          projectTransfer={
            pendingProjectTransfers?.length === 0
              ? undefined
              : project.project_transfers[0]
          }
          creator={project.profiles}
          valuation={isNaN(valuation) ? undefined : valuation}
          creatorEmail={creatorEmail}
        />
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
        {project.description && (
          <Description description={project.description} />
        )}
        {(isOwnProject || userIsAdmin) && (
          <Edit project={project} causesList={causesList} />
        )}
        <Divider />
        {project.stage !== 'proposal' && project.type === 'cert' && (
          <CertValuationChart
            tradePoints={tradePoints}
            ammTxns={projectTxns.filter(
              (txn) => txn.to_id === project.id || txn.from_id === project.id
            )}
            ammId={project.id}
            size="lg"
          />
        )}
        <ProjectData
          project={project}
          raised={amountRaised}
          valuation={valuation}
        />
        {(project.stage === 'proposal' ||
          (project.stage === 'active' && project.type === 'grant')) && (
          <ProgressBar
            amountRaised={amountRaised}
            minFunding={project.min_funding}
            fundingGoal={project.funding_goal}
          />
        )}
        {userProfile &&
          project.type === 'cert' &&
          project.stage !== 'proposal' && (
            <Trade
              ammTxns={projectTxns.filter(
                (txn) => txn.to_id === project.id || txn.from_id === project.id
              )}
              ammId={project.id}
              userSpendableFunds={userSpendableFunds}
              userSellableShares={userSellableShares}
            />
          )}
        {userProfile &&
          userProfile.id !== project.creator &&
          project.type === 'cert' &&
          project.stage === 'proposal' && (
            <AssuranceBuyBox
              project={project}
              valuation={valuation}
              offerSizeDollars={
                (projectBids.find((bid) => bid.type === 'assurance sell')
                  ?.amount ?? 0) - amountRaised
              }
              maxBuy={userSpendableFunds}
            />
          )}
        {userProfile &&
          userProfile.id !== project.creator &&
          project.type === 'grant' &&
          pendingProjectTransfers.length === 0 &&
          (project.stage === 'proposal' || project.stage === 'active') && (
            <DonateBox
              project={project}
              profile={userProfile}
              maxDonation={userSpendableFunds}
              setCommentPrompt={setSpecialCommentPrompt}
            />
          )}
        {!userProfile && <SignInButton />}
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
          />
        </div>
      </Col>
    </>
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
