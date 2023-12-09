import { createServerClient } from '@/db/supabase-server'
import { getUser, isAdmin, getProfileAndBidsById } from '@/db/profile'
import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getPendingBidsByProject } from '@/db/bid'
import { getTxnsByProject, getTxnAndProjectsByUser } from '@/db/txn'
import { getUserEmail } from '@/utils/email'
import { createAdminClient } from '@/pages/api/_db'
import { ProjectDisplay } from './project-display'
import { listMiniCauses, listPrizeCauses } from '@/db/cause'
import { getBidsByUser } from '@/db/bid'

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
  const [
    userProfile,
    userTxns,
    userBids,
    comments,
    projectBids,
    projectTxns,
    causesList,
    prizeCauses,
  ] = await Promise.all([
    user ? await getProfileAndBidsById(supabase, user.id) : null,
    user ? getTxnAndProjectsByUser(supabase, user.id) : [],
    user ? getBidsByUser(supabase, user.id) : [],
    getCommentsByProject(supabase, project.id),
    getPendingBidsByProject(supabase, project.id),
    getTxnsByProject(supabase, project.id),
    listMiniCauses(supabase),
    listPrizeCauses(supabase),
  ])
  const creatorEmail = userProfile?.regranter_status
    ? await getUserEmail(createAdminClient(), project.creator)
    : undefined
  const userIsAdmin = user ? isAdmin(user) : false
  return (
    <div className="p-4">
      <ProjectDisplay
        project={project}
        userTxns={userTxns}
        userBids={userBids}
        comments={comments}
        projectBids={projectBids}
        projectTxns={projectTxns}
        creatorEmail={creatorEmail}
        userProfile={userProfile ?? undefined}
        causesList={causesList}
        prizeCauses={prizeCauses}
        userIsAdmin={userIsAdmin}
      />
    </div>
  )
}
