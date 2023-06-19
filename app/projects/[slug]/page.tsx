import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById, isAdmin } from '@/db/profile'
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
  getProposalValuation,
} from '@/utils/math'
import { ProposalData } from './proposal-data'
import { SignInButton } from '@/components/sign-in-button'
import { ProjectTabs } from './project-tabs'
import { getTxnsByProject } from '@/db/txn'
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
  const project = await getFullProjectBySlug(supabase, slug)
  if (!project) {
    return <div>404</div>
  }
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const comments = await getCommentsByProject(supabase, project.id)
  const bids = await getBidsByProject(supabase, project.id)
  const txns = await getTxnsByProject(supabase, project.id)
  const userSpendableFunds = profile
    ? profile.accreditation_status && project.type === 'cert'
      ? calculateCashBalance(txns, bids, profile.id, true)
      : calculateCharityBalance(
          txns,
          bids,
          profile.id,
          profile.accreditation_status
        )
    : 0
  const userSellableShares = profile
    ? calculateSellableShares(txns, bids, project.id, profile.id)
    : 0
  const userShares = profile ? calculateShares(txns, project.id, profile.id) : 0
  const valuation =
    project.type === 'grant'
      ? project.funding_goal
      : project.stage === 'proposal'
      ? getProposalValuation(project)
      : getActiveValuation(txns, bids, getProposalValuation(project))

  const isOwnProject = user?.id === project.profiles.id
  const pendingProjectTransfers = project.project_transfers?.filter(
    (projectTransfer) => !projectTransfer.transferred
  )
  const raised = bids.reduce((acc, bid) => {
    if (bid.status === 'pending') {
      return acc + bid.amount
    } else {
      return acc
    }
  }, 0)
  return (
    <>
      {project.type === 'grant' &&
        project.stage === 'proposal' &&
        pendingProjectTransfers.length === 0 && (
          <ProposalRequirements
            signedAgreement={project.signed_agreement}
            approved={project.approved === true}
            reachedMinFunding={raised >= project.min_funding}
            projectSlug={project.slug}
          />
        )}
      <div className="flex flex-col gap-4 px-4 pt-5">
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
        />
        <div>
          <h2 className="text-3xl font-bold">{project.title}</h2>
        </div>
        {project.description && (
          <Description>
            <RichContent content={project.description} />
          </Description>
        )}
        {isOwnProject && <EditDescription project={project} />}
        {project.stage === 'proposal' && (
          <>
            <Divider />
            <ProposalData project={project} raised={raised} />
          </>
        )}
        {profile !== null && project.type === 'cert' && (
          <PlaceBid
            project={project}
            user={profile}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
            userShares={userShares}
          />
        )}
        {profile !== null &&
          project.type === 'grant' &&
          pendingProjectTransfers.length === 0 && (
            <DonateBox
              project={project}
              userId={profile.id}
              maxDonation={userSpendableFunds}
            />
          )}
        {!user && <SignInButton />}
        <ProjectTabs
          project={project}
          user={profile}
          comments={comments}
          bids={bids}
          txns={txns}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
        {isAdmin(user) && <CloseBidding project={project} />}
      </div>
    </>
  )
}
