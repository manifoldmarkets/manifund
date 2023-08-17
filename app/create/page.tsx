import { createServerClient } from '@/db/supabase-server'
import { getMiniTopics } from '@/db/topic'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const topics = await getMiniTopics(supabase)
  return <CreateProjectForm topics={topics} />
}
