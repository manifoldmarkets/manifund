import { createServerClient } from '@/db/supabase-server'
import { getUser, isAdmin, getProfileAndBidsById } from '@/db/profile'
import { PlaceBid } from './place-bid'
import { RichContent } from '@/components/editor'
import { CloseBidding } from './close-bidding'
import { EditDescription } from './edit-description'
import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import {
  calculateShares,
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import { ProposalData } from './proposal-data'
import { SignInButton } from '@/components/sign-in-button'
import { ProjectTabs } from './project-tabs'
import { getTxnsByProject, getTxnsByUser } from '@/db/txn'
import { Description } from './description'
import { ProjectCardHeader } from '@/components/project-card'
import {
  calculateSellableShares,
  calculateCharityBalance,
  calculateCashBalance,
} from '@/utils/math'
import { DonateBox } from '@/components/donate-box'
import { Divider } from '@/components/divider'
import { ProposalRequirements } from './proposal-requirements'
import { ProgressBar } from '@/components/progress-bar'
import { getUserEmail } from '@/utils/email'
import { createAdminClient } from '@/pages/api/_db'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Vote } from '@/app/projects/[slug]/vote'

export const revalidate = 0

export async function generateMetadata(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = createServerClient()
  const project = await getProjectBySlug(supabase, slug)
  return {
    title: project.title,
  }
}

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = createServerClient()
  const [project, user] = await Promise.all([
    getFullProjectBySlug(supabase, slug),
    getUser(supabase),
  ])
  if (!project) {
    return <div>404: Project not found.</div>
  }
  const [profile, userTxns, comments, projectBids, projectTxns] =
    await Promise.all([
      user ? await getProfileAndBidsById(supabase, user.id) : null,
      user ? getTxnsByUser(supabase, user.id) : [],
      getCommentsByProject(supabase, project.id),
      getBidsByProject(supabase, project.id),
      getTxnsByProject(supabase, project.id),
    ])
  const creatorEmail = profile?.regranter_status
    ? await getUserEmail(createAdminClient(), project.creator)
    : undefined
  const userSpendableFunds = profile
    ? profile.accreditation_status && project.type === 'cert'
      ? calculateCashBalance(userTxns, profile.bids, profile.id, true)
      : calculateCharityBalance(
          userTxns,
          profile.bids,
          profile.id,
          profile.accreditation_status
        )
    : 0
  const userSellableShares = profile
    ? calculateSellableShares(userTxns, profile.bids, project.id, profile.id)
    : 0
  const userShares = profile
    ? calculateShares(userTxns, project.id, profile.id)
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
  const isOwnProject = user?.id === project.profiles.id
  const pendingProjectTransfers = project.project_transfers?.filter(
    (projectTransfer) => !projectTransfer.transferred
  )
  const amountRaised = getAmountRaised(project, projectBids, projectTxns)
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
      <Col className="gap-4 px-4 pt-5">
        <ProjectCardHeader
          round={project.rounds}
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
        <Row className="flex-2 items-center gap-3">
          <Vote
            projectId={project.id}
            userId={user?.id}
            votes={project.project_votes}
          />
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
        </Row>
        {project.description && (
          <div className="px-3">
            <Description>
              <RichContent content={project.description} />
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
        {profile !== null && project.type === 'cert' && (
          <PlaceBid
            project={project}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
            userShares={userShares}
          />
        )}
        {profile !== null &&
          project.type === 'grant' &&
          pendingProjectTransfers.length === 0 &&
          (project.stage === 'proposal' || project.stage === 'active') && (
            <DonateBox
              project={project}
              profile={profile}
              maxDonation={userSpendableFunds}
            />
          )}
        {!user && <SignInButton />}
        <div id="tabs">
          <ProjectTabs
            project={project}
            user={profile}
            comments={comments}
            bids={projectBids}
            txns={projectTxns}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
          />
        </div>
        {isAdmin(user) && <CloseBidding project={project} />}
      </Col>
    </>
  )
}
