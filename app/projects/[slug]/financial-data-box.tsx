import { Button } from '@/components/button'
import { DonateBox } from '@/components/donate-box'
import { AmountInput } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { ProgressBar } from '@/components/progress-bar'
import { SignInButton } from '@/components/sign-in-button'
import { Slider } from '@/components/slider'
import { Stat } from '@/components/stat'
import { Tooltip } from '@/components/tooltip'
import { BidAndProfile, BidAndProject } from '@/db/bid'
import { Cause } from '@/db/cause'
import { Profile } from '@/db/profile'
import { FullProject, Project } from '@/db/project'
import { TxnAndProfiles, TxnAndProject } from '@/db/txn'
import { calculateTradePoints } from '@/utils/amm'
import {
  formatMoney,
  formatMoneyPrecise,
  formatPercent,
  toSentenceCase,
} from '@/utils/formatting'
import {
  calculateCashBalance,
  calculateCharityBalance,
  calculateSellableShares,
  getActiveValuation,
  getAmountRaised,
  getMinIncludingAmm,
  getProposalValuation,
} from '@/utils/math'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AssuranceBuyBox } from './assurance-buy-box'
import { ProjectData } from './project-data'
import { Trade } from './trade'
import { CertValuationChart } from './valuation-chart'

export function FinancialDataBox(props: {
  project: FullProject
  userTxns: TxnAndProject[]
  userBids: BidAndProject[]
  projectBids: BidAndProfile[]
  projectTxns: TxnAndProfiles[]
  prizeCause?: Cause
  userProfile?: Profile
}) {
  const {
    project,
    userTxns,
    userBids,
    projectBids,
    projectTxns,
    prizeCause,
    userProfile,
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
    <div className="border-t border-gray-200 py-6">
      <ProjectTypeDisplay type={project.type} stage={project.stage} />
      <div className="pb-6 sm:col-span-2">
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
      <Col className="gap-6 sm:col-span-2">
        {!['draft', 'proposal'].includes(project.stage) &&
          project.type === 'cert' &&
          !!project.amm_shares && (
            <CertValuationChart
              tradePoints={tradePoints}
              ammTxns={projectTxns.filter(
                (txn) => txn.to_id === project.id || txn.from_id === project.id
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
    </div>
  )
}

export function ProjectTypeDisplay(props: {
  type: Project['type']
  stage: Project['stage']
}) {
  const { type, stage } = props
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
    <div className="px-4 pb-6 sm:px-0">
      <dt className="text-sm leading-6 text-gray-700">{label}</dt>
      <dd className="text-sm font-medium leading-6 text-gray-900">{value}</dd>
    </div>
  )
}

function LargeDescriptionPoint(props: { label: string; value: string }) {
  const { label, value } = props
  return (
    <div className="px-4 pb-6 sm:px-0">
      <dt className="text-sm leading-6 text-gray-700">{label}</dt>
      <dd className="text-lg font-semibold leading-6 text-gray-900">{value}</dd>
    </div>
  )
}

const typeToLabelMap = {
  cert: 'Impact certificate',
  grant: 'Grant',
  dummy: 'Uninteractable stand in',
}
