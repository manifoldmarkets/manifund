import { createServerClient } from '@/db/supabase-server'
import { listCauses } from '@/db/cause'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const causesList = await listCauses(supabase)
  return <CreateProjectForm causesList={causesList} />
}
