import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, isAdmin, getProfileAndBidsById } from '@/db/profile'
import {
  getFullProjectBySlug,
  getFullSimilarProjects,
  getProjectBySlug,
} from '@/db/project'
import { getCommentsByProject } from '@/db/comment'
import { getBidsByProject } from '@/db/bid'
import { getTxnsByProject, getTxnAndProjectsByUser } from '@/db/txn'
import { getUserEmail } from '@/utils/email'
import { createAdminClient } from '@/pages/api/_db'
import { ProjectDisplay } from './project-display'
import { getPrizeCause, listSimpleCauses } from '@/db/cause'
import { getBidsByUser } from '@/db/bid'
import NotFound from '@/app/not-found'
import NoAccess from '@/app/no-access'

export const revalidate = 0

export async function generateMetadata(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = await createServerSupabaseClient()
  const project = await getProjectBySlug(supabase, slug)
  const description = project.blurb ?? 'A project on Manifund'
  return {
    title: project.title,
    description: description,
    openGraph: {
      title: project.title,
      description: description,
      type: 'website',
      url: `https://manifund.org/projects/${project.slug}`,
    },
    robots: {
      index: project.stage !== 'hidden' && project.stage !== 'draft',
    },
  }
}

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = await createServerSupabaseClient()
  const [project, user] = await Promise.all([
    getFullProjectBySlug(supabase, slug),
    getUser(supabase),
  ])
  if (!project) {
    return <NotFound />
  }
  const [
    userProfile,
    userTxns,
    userBids,
    comments,
    projectBids,
    projectTxns,
    causesList,
    similarProjects,
  ] = await Promise.all([
    user ? await getProfileAndBidsById(supabase, user.id) : null,
    user ? getTxnAndProjectsByUser(supabase, user.id) : [],
    user ? getBidsByUser(supabase, user.id) : [],
    getCommentsByProject(supabase, project.id),
    getBidsByProject(supabase, project.id),
    getTxnsByProject(supabase, project.id),
    listSimpleCauses(supabase),
    getFullSimilarProjects(supabase, project.id, 3),
  ])
  const prizeCause = await getPrizeCause(
    project.causes.map((c) => c.slug),
    supabase
  )
  const creatorEmail = userProfile?.regranter_status
    ? await getUserEmail(createAdminClient(), project.creator)
    : undefined
  const userIsAdmin = user ? isAdmin(user) : false
  const userIsOwner = user?.id === project.creator
  const projectIsPrivate =
    project.stage === 'hidden' || project.stage === 'draft'
  return (
    <div className="p-4">
      {projectIsPrivate && !userIsOwner && !userIsAdmin ? (
        <NoAccess />
      ) : (
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
          prizeCause={prizeCause}
          userIsAdmin={userIsAdmin}
          similarProjects={similarProjects}
        />
      )}
    </div>
  )
}
