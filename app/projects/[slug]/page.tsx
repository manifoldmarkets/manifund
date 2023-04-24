import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById, isAdmin } from '@/db/profile'
import { PlaceBid } from './place-bid'
import { RichContent } from '@/components/editor'
import { CloseBidding } from './close-bidding'
import { EditDescription } from './edit-description'
import {
  getFullProjectBySlug,
  getProjectBySlug,
  TOTAL_SHARES,
} from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import { getActiveValuation, getProposalValuation } from '@/utils/math'
import { ProposalData } from './proposal-data'
import { SignInButton } from '@/components/sign-in-button'
import { ProjectTabs } from './project-tabs'
import { getTxnsByProject } from '@/db/txn'
import { Description } from './description'
import { ProjectCardHeader } from '@/components/project-card'
import { calculateUserFundsAndShares } from '@/utils/math'
import { DonateBox } from '@/components/donate-box'

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
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const { userSpendableFunds, userSellableShares, userShares } = user
    ? await calculateUserFundsAndShares(
        supabase,
        user.id,
        project.id,
        profile?.accreditation_status as boolean
      )
    : { userSpendableFunds: 0, userSellableShares: 0, userShares: 0 }
  const comments = await getCommentsByProject(supabase, project.id)
  const bids = await getBidsByProject(supabase, project.id)
  const txns = await getTxnsByProject(supabase, project.id)
  const valuation =
    project.type === 'grant'
      ? project.funding_goal
      : project.stage === 'proposal'
      ? getProposalValuation(project)
      : getActiveValuation(txns, bids, getProposalValuation(project))

  const isOwnProject = user?.id === project.profiles.id

  return (
    <div className="flex flex-col gap-4 px-4">
      <ProjectCardHeader
        round={project.rounds}
        projectType={project.type}
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
      <hr className="mb-3 h-0.5 rounded-sm bg-gray-500" />
      {project.stage === 'proposal' && (
        <ProposalData
          project={project}
          bids={project.bids.filter((bid) => bid.status === 'pending')}
        />
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
      {profile !== null && project.type === 'grant' && (
        <DonateBox
          project={project}
          userId={profile.id}
          userSpendableFunds={userSpendableFunds}
        />
      )}
      {!user && <SignInButton />}
      <div className="h-6" />
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
  )
}
