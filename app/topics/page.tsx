import { createServerClient } from '@/db/supabase-server'
import { listTopics } from '@/db/topic'

export default async function TopicsPage() {
  const supabase = createServerClient()
  const topicsList = await listTopics(supabase)
  return <div>Topics</div>
}
