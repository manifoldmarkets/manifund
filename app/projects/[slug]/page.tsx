import { createServerClient } from '@/db/supabase-server'
import { getUser, isAdmin, getProfileAndBidsById } from '@/db/profile'
import { CloseBidding } from './close-bidding'
import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import {
  calculateShares,
  getActiveValuation,
  getAmountRaised,
  getProposalValuation,
} from '@/utils/math'
import { getTxnsByProject, getTxnsByUser } from '@/db/txn'
import {
  calculateSellableShares,
  calculateCharityBalance,
  calculateCashBalance,
} from '@/utils/math'
import { getUserEmail } from '@/utils/email'
import { createAdminClient } from '@/pages/api/_db'
import { ProjectDisplay } from './project-display'

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
  const [userProfile, userTxns, comments, projectBids, projectTxns] =
    await Promise.all([
      user ? await getProfileAndBidsById(supabase, user.id) : null,
      user ? getTxnsByUser(supabase, user.id) : [],
      getCommentsByProject(supabase, project.id),
      getBidsByProject(supabase, project.id),
      getTxnsByProject(supabase, project.id),
    ])
  const creatorEmail = userProfile?.regranter_status
    ? await getUserEmail(createAdminClient(), project.creator)
    : undefined
  return (
    <>
      <ProjectDisplay
        project={project}
        userTxns={userTxns}
        comments={comments}
        projectBids={projectBids}
        projectTxns={projectTxns}
        creatorEmail={creatorEmail}
        userProfile={userProfile ?? undefined}
      />
      {isAdmin(user) && <CloseBidding project={project} />}
    </>
  )
}
