import { createServerClient } from '@/db/supabase-server'
import { getUser, getProfileById, isAdmin } from '@/db/profile'
import { PlaceBid } from './place-bid'
import { RichContent } from '@/components/editor'
import { CloseBidding } from './close-bidding'
import { EditDescription } from './edit-description'
import { BidsTable } from '../bids-table'
import { formatLargeNumber } from '@/utils/formatting'
import { getFullProjectBySlug } from '@/db/project'
import { getProposalValuation, getActiveValuation } from '@/utils/math'
import { ProposalData } from './proposal-data'
import { ProjectPageHeader } from './project-page-header'
import { SiteLink } from '@/components/site-link'
import { SignInButton } from '@/components/sign-in-button'
import clsx from 'clsx'
import { buttonClass } from '@/components/button'
import { Comments } from './comments'

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params

  const supabase = createServerClient()
  const project = await getFullProjectBySlug(supabase, slug)
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)

  const isOwnProject = user?.id === project.profiles.id

  const valuation =
    project.stage == 'proposal'
      ? getProposalValuation(project)
      : formatLargeNumber(
          getActiveValuation(project.txns, project.founder_portion)
        )

  return (
    <div className="flex flex-col gap-4 px-4">
      <ProjectPageHeader
        round={project.round}
        creator={project.profiles}
        valuation={valuation}
      />
      <div>
        <h2 className="text-3xl font-bold">{project.title}</h2>
      </div>
      {project.description && <RichContent content={project.description} />}
      {isOwnProject && <EditDescription project={project} />}
      <hr className="mb-3 mt-5 h-0.5 rounded-sm bg-gray-500" />
      {project.stage == 'proposal' && (
        <ProposalData project={project} bids={project.bids} />
      )}
      {user && profile?.accreditation_status && (
        <PlaceBid
          projectId={project.id}
          projectStage={project.stage}
          minFunding={project.min_funding}
          founderPortion={project.founder_portion}
          userId={user?.id}
        />
      )}
      {user && !profile?.accreditation_status && <NotAccredited />}
      {!user && <SignInButton />}
      <div className="h-6" />

      {/* @ts-expect-error Server Component */}
      {project.stage == 'active' && <BidsTable projectId={project.id} />}
      {/* @ts-expect-error Server Component */}
      <Comments project={project.id} profile={profile} />
      {isAdmin(user) && <CloseBidding project={project} />}
    </div>
  )
}

function NotAccredited() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-md">
      You&apos;ll need to demonstrate that you&apos;re an accredited investor
      before you can invest in projects.
      <SiteLink
        href="https://airtable.com/shrZVLeo6f34NBfR0"
        className={clsx(
          buttonClass('xl', 'gradient'),
          'mx-auto mt-4 max-w-md bg-gradient-to-r'
        )}
      >
        Verify status
      </SiteLink>
    </div>
  )
}
