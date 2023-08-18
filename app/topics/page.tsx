import { createServerClient } from '@/db/supabase-server'
import { FullTopic, listFullTopics } from '@/db/topic'
import Image from 'next/image'
import Link from 'next/link'

export default async function TopicsPage() {
  const supabase = createServerClient()
  const topicsList = await listFullTopics(supabase)
  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {topicsList.map((topic) => (
        <TopicCard key={topic.slug} topic={topic} />
      ))}
    </div>
  )
}

function TopicCard(props: { topic: FullTopic }) {
  const { topic } = props
  const numProjects = topic.projects.filter(
    (project) => project.stage !== 'hidden'
  ).length
  return (
    <Link
      className="relative rounded bg-white shadow-md"
      href={`/topics/${topic.slug}`}
    >
      <Image
        src={topic.header_image_url}
        width={1000}
        height={500}
        className="relative aspect-[3/1] w-full flex-shrink-0 rounded-t bg-white object-cover sm:aspect-[5/3]"
        alt="round header image"
      />
      <p className="px-4 pt-2 pb-10 font-semibold leading-tight lg:text-lg">
        {topic.title}
      </p>
      <p className="absolute bottom-2 right-4 text-xs text-gray-600 sm:text-sm">
        {numProjects} projects
      </p>
    </Link>
  )
}
