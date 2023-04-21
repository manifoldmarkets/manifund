import { getRounds } from '@/db/round'
import { createServerClient } from '@/db/supabase-server'
import { CreateProjectForm } from './create-project-form'

export const revalidate = 0
export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const rounds = await getRounds(supabase)
  return <CreateProjectForm rounds={rounds} />
}
