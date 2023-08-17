'use client'
import { Divider } from '@/components/divider'
import { DonateBox } from '@/components/donate-box'
import { RichContent } from '@/components/editor'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProgressBar } from '@/components/progress-bar'
import { ProjectCardHeader } from '@/components/project-card'
import { SignInButton } from '@/components/sign-in-button'
import { BidAndProfile } from '@/db/bid'
import { CommentAndProfile } from '@/db/comment'
import { ProfileAndBids } from '@/db/profile'
import { FullProject } from '@/db/project'
import { Txn, TxnAndProfiles } from '@/db/txn'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
  calculateShares,
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'
import { useState } from 'react'
import { Description } from './description'
import { EditDescription } from './edit-description'
import { PlaceBid } from './place-bid'
import { ProjectTabs } from './project-tabs'
import { ProposalData } from './proposal-data'
import { ProposalRequirements } from './proposal-requirements'
import { Vote } from './vote'

export function ProjectDisplay(props: {
  project: FullProject
  userTxns: Txn[]
  comments: CommentAndProfile[]
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
  userProfile?: ProfileAndBids
  creatorEmail?: string
}) {
  const {
    project,
    userTxns,
    comments,
    projectBids,
    projectTxns,
    userProfile,
    creatorEmail,
  } = props
  const userSpendableFunds = userProfile
    ? userProfile.accreditation_status && project.type === 'cert'
      ? calculateCashBalance(userTxns, userProfile.bids, userProfile.id, true)
      : calculateCharityBalance(
          userTxns,
          userProfile.bids,
          userProfile.id,
          userProfile.accreditation_status
        )
    : 0
  const userSellableShares = userProfile
    ? calculateSellableShares(
        userTxns,
        userProfile.bids,
        project.id,
        userProfile.id
      )
    : 0
  const userShares = userProfile
    ? calculateShares(userTxns, project.id, userProfile.id)
    : 0
  const valuation =
    project.type === 'grant'
      ? project.funding_goal
      : project.stage === 'proposal'
      ? getProposalValuation(project)
      : getActiveValuation(
          projectTxns,
          projectBids,
          getProposalValuation(project)
        )
  const isOwnProject = userProfile?.id === project.profiles.id
  const pendingProjectTransfers = project.project_transfers?.filter(
    (projectTransfer) => !projectTransfer.transferred
  )
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
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
      <div className="flex flex-col gap-4 px-4 pt-5">
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
            <h2 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h2>
          </Row>
          <p className="text-sm italic text-gray-600">{project.blurb}</p>
        </Col>

        {project.description && (
          <div className="px-3">
            <Description>
              <RichContent
                content={project.description}
                className="sm:text-md text-sm"
              />
            </Description>
          </div>
        )}
        {isOwnProject && <EditDescription project={project} />}
        {project.stage === 'proposal' && (
          <>
            <Divider />
            <ProposalData project={project} raised={amountRaised} />
          </>
        )}
        {(project.stage === 'proposal' ||
          (project.stage === 'active' && project.type === 'grant')) && (
          <ProgressBar
            amountRaised={amountRaised}
            minFunding={project.min_funding}
            fundingGoal={project.funding_goal}
          />
        )}
        {userProfile && project.type === 'cert' && (
          <PlaceBid
            project={project}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
            userShares={userShares}
          />
        )}
        {userProfile &&
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
      </div>
    </>
  )
}

export function scrollToComments(router: AppRouterInstance) {
  router.push('?tab=comments')
  const tabsElement = document.getElementById('tabs')
  tabsElement?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'start',
  })
}
