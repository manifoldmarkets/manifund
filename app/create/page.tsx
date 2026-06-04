import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { listCauses } from '@/db/cause'
import { getUser } from '@/db/profile'
import { CreateProjectForm } from './create-project-form'

export default async function CreateProposalPage() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  if (!user) {
    redirect('/login')
  }
  const causesList = await listCauses(supabase)
  return <CreateProjectForm causesList={causesList} />
}
