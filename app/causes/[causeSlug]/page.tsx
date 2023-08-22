import { createServerClient } from '@/db/supabase-server'
import { FullProject, getFullProjectsByCause } from '@/db/project'
import Image from 'next/image'
import { getCause, listMiniCauses } from '@/db/cause'
import { ProjectsDisplay } from '@/components/projects-display'
import { getAmountRaised } from '@/utils/math'
import { Row } from '@/components/layout/row'
import { DataPoint } from '@/components/data-point'
import { formatMoney } from '@/utils/formatting'

export const revalidate = 60

export async function generateMetadata(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  return {
    title: cause.slug,
  }
}

export default async function CausePage(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  const causesList = await listMiniCauses(supabase)
  const projects = await getFullProjectsByCause(supabase, cause.slug)
  return (
    <div className="bg-dark-200 max-w-4xl p-3">
      {cause.header_image_url && (
        <Image
          src={cause.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="my-3 text-2xl font-bold lg:text-3xl">{cause.title}</h1>
      <CauseData projects={projects} />
      <ProjectsDisplay projects={projects} causesList={causesList} noFilter />
    </div>
  )
}

function CauseData(props: { projects: FullProject[] }) {
  const { projects } = props
  const numActiveProjects = projects.filter(
    (project) => project.stage === 'active'
  ).length
  const numProposalProjects = projects.filter(
    (project) => project.stage === 'proposal'
  ).length
  const totalRaised = projects.reduce((acc, project) => {
    return acc + getAmountRaised(project, project.bids, project.txns)
  }, 0)
  return (
    <Row className="my-3 justify-between px-5">
      <DataPoint label="proposals" value={numProposalProjects.toString()} />
      <DataPoint label="active projects" value={numActiveProjects.toString()} />
      <DataPoint label="given" value={formatMoney(totalRaised)} />
    </Row>
  )
}
