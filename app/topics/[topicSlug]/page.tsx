import { createServerClient } from '@/db/supabase-server'
import { FullProject, getFullProjectsByTopic } from '@/db/project'
import Image from 'next/image'
import { FullTopic, getTopic, listMiniTopics } from '@/db/topic'
import { ProjectsDisplay } from '@/components/projects-display'
import { getAmountRaised } from '@/utils/math'

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
      <h1 className="mt-4 mb-12 text-4xl font-bold">{topic.title}</h1>
      <ProjectsDisplay projects={projects} topicsList={topicsList} noFilter />
    </div>
  )
}
export function TopicData(props: {
  topic: FullTopic
  projects: FullProject[]
}) {
  const { topic, projects } = props
  const numProjects = projects.filter(
    (project) => project.stage !== 'hidden'
  ).length
  const totalRaised = projects.reduce((acc, project) => {
    return acc + getAmountRaised(project, project.bids, project.txns)
  }, 0)
}
