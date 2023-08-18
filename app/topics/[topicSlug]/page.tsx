import { createServerClient } from '@/db/supabase-server'
import { FullProject, getFullProjectsByTopic } from '@/db/project'
import Image from 'next/image'
import { FullTopic, getTopic, listMiniTopics } from '@/db/topic'
import { ProjectsDisplay } from '@/components/projects-display'
import { getAmountRaised } from '@/utils/math'
import { Row } from '@/components/layout/row'
import { DataPoint } from '@/components/data-point'
import { formatMoney } from '@/utils/formatting'
import {
  CurrencyDollarIcon,
  EllipsisHorizontalCircleIcon,
  FireIcon,
} from '@heroicons/react/20/solid'

export const revalidate = 60

export async function generateMetadata(props: {
  params: { topicSlug: string }
}) {
  const { topicSlug } = props.params
  const supabase = createServerClient()
  const topic = await getTopic(supabase, topicSlug)
  return {
    title: topic.slug,
  }
}

export default async function TopicPage(props: {
  params: { topicSlug: string }
}) {
  const { topicSlug } = props.params
  const supabase = createServerClient()
  const topic = await getTopic(supabase, topicSlug)
  const topicsList = await listMiniTopics(supabase)
  const projects = await getFullProjectsByTopic(supabase, topic.slug)
  return (
    <div className="bg-dark-200 max-w-4xl p-5">
      {topic.header_image_url && (
        <Image
          src={topic.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="my-4 text-4xl font-bold">{topic.title}</h1>
      <TopicData projects={projects} />
      <ProjectsDisplay projects={projects} topicsList={topicsList} noFilter />
    </div>
  )
}

export function TopicData(props: { projects: FullProject[] }) {
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
    <div className="border-1 my-5 grid grid-cols-1 divide-y rounded-lg bg-white shadow sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
      <Row className="h-min items-center gap-2 overflow-hidden px-3 py-4">
        <Row className="h-min items-center justify-center rounded bg-orange-500 p-2 text-white">
          <EllipsisHorizontalCircleIcon className="h-5 w-5" />
        </Row>
        <DataPoint label="proposals" value={numProposalProjects.toString()} />
      </Row>
      <Row className="h-min items-center gap-2 overflow-hidden px-3 py-4">
        <Row className="h-min items-center justify-center rounded bg-orange-500 p-2 text-white">
          <FireIcon className="h-5 w-5" />
        </Row>
        <DataPoint
          label="active projects"
          value={numActiveProjects.toString()}
        />
      </Row>
      <Row className="h-min items-center gap-2 overflow-hidden px-3 py-4">
        <Row className="h-min items-center justify-center rounded bg-orange-500 p-2 text-white">
          <CurrencyDollarIcon className="h-5 w-5" />
        </Row>
        <DataPoint label="given" value={formatMoney(totalRaised)} />
      </Row>
    </div>
  )
}
