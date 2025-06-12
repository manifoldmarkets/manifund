import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { getRecentFullBids } from '@/db/bid'
import { listSimpleCauses } from '@/db/cause'
import { listProjects } from '@/db/project'
import { createPublicSupabaseClient } from '@/db/supabase-server'
import { ProjectsPageWrapper } from './projects-page-wrapper'

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // this does not use cookies, it won't override the ISR behavior and make this page dynamically rendered
  const supabase = createPublicSupabaseClient()

  const PAGE_SIZE = 20
  const page = parseInt(props.searchParams?.p as string) || 1
  const tab = props.searchParams?.tab as string
  const shouldLoadProjects = !tab || tab === 'projects'
  const start = (page - 1) * PAGE_SIZE

  const [projects, recentComments, recentDonations, recentBids, causesList] =
    await Promise.all([
      shouldLoadProjects ? listProjects(supabase) : Promise.resolve([]),
      getRecentFullComments(supabase, PAGE_SIZE, start),
      getRecentFullTxns(supabase, PAGE_SIZE, start),
      getRecentFullBids(supabase, PAGE_SIZE, start),
      listSimpleCauses(supabase),
    ])

  return (
    // this page uses cookies, so it will be dynamically rendered, but the projects fed into the wrapper will be static
    <ProjectsPageWrapper
      recentComments={recentComments}
      recentDonations={recentDonations}
      recentBids={recentBids}
      projects={projects}
      causesList={causesList}
    />
  )
}
