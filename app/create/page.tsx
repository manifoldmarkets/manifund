import { createServerClient } from '@/db/supabase-server'
import { listMiniCauses } from '@/db/cause'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const causesList = await listMiniCauses(supabase)
  return <CreateProjectForm causesList={causesList} />
}
