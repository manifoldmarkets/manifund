import { getRounds } from '@/db/round'
import { createServerClient } from '@/db/supabase-server'
import { CreateProposalForm } from './create-proposal-form'

export default async function CreateProposalPage() {
  const supabase = createServerClient()
  const rounds = await getRounds(supabase)
  return <CreateProposalForm rounds={rounds} />
}
