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
    <div className="bg-dark-200 max-w-4xl p-3">
      {topic.header_image_url && (
        <Image
          src={topic.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="my-3 text-2xl font-bold lg:text-3xl">{topic.title}</h1>
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
    <Row className="my-3 justify-between px-5">
      <DataPoint label="proposals" value={numProposalProjects.toString()} />
      <DataPoint label="active projects" value={numActiveProjects.toString()} />
      <DataPoint label="given" value={formatMoney(totalRaised)} />
    </Row>
  )
}
