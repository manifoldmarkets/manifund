import { createServerClient } from '@/db/supabase-server'
import { listTopics, Topic } from '@/db/topic'
import Image from 'next/image'

export default async function TopicsPage() {
  const supabase = createServerClient()
  const topicsList = await listTopics(supabase)
  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {topicsList.map((topic) => (
        <TopicCard key={topic.slug} topic={topic} />
      ))}
    </div>
  )
}

function TopicCard(props: { topic: Topic }) {
  const { topic } = props
  return (
    <div className="rounded bg-white shadow-md">
      <Image
        src={topic.header_image_url}
        width={1000}
        height={500}
        className="relative aspect-[3/1] w-full flex-shrink-0 rounded-t bg-white object-cover sm:aspect-[5/3]"
        alt="round header image"
      />
      <div className="py-2 px-4">
        <span className="sm:text-md text-sm font-semibold leading-tight lg:text-lg">
          {topic.title}
        </span>
      </div>
    </div>
  )
}
