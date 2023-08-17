import { createServerClient } from '@/db/supabase-server'
import { getTopics } from '@/db/topic'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const topics = await getTopics(supabase)
  return <CreateProjectForm topics={topics} />
}
