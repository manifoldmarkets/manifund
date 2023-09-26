import { createServerClient } from '@/db/supabase-server'
import { getUser, isAdmin, getProfileAndBidsById } from '@/db/profile'
import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import { getTxnsByProject, getTxnsByUser } from '@/db/txn'
import { getUserEmail } from '@/utils/email'
import { createAdminClient } from '@/pages/api/_db'
import { ProjectDisplay } from './project-display'
import { listMiniCauses } from '@/db/cause'

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
    comments,
    projectBids,
    projectTxns,
    causesList,
  ] = await Promise.all([
    user ? await getProfileAndBidsById(supabase, user.id) : null,
    user ? getTxnsByUser(supabase, user.id) : [],
    getCommentsByProject(supabase, project.id),
    getBidsByProject(supabase, project.id),
    getTxnsByProject(supabase, project.id),
    listMiniCauses(supabase),
  ])
  const creatorEmail = userProfile?.regranter_status
    ? await getUserEmail(createAdminClient(), project.creator)
    : undefined
  const userIsAdmin = user ? isAdmin(user) : false
  return (
    <div className="p-4">
      {project.stage === 'hidden' && (
        <meta name="robots" content="noindex" key="robots" />
      )}
      <ProjectDisplay
        project={project}
        userTxns={userTxns}
        comments={comments}
        projectBids={projectBids}
        projectTxns={projectTxns}
        creatorEmail={creatorEmail}
        userProfile={userProfile ?? undefined}
        causesList={causesList}
        userIsAdmin={userIsAdmin}
      />
    </div>
  )
}
