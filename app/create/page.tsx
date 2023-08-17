import { createServerClient } from '@/db/supabase-server'
import { listMiniTopics } from '@/db/topic'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const topicsList = await listMiniTopics(supabase)
  return <CreateProjectForm topicsList={topicsList} />
}
