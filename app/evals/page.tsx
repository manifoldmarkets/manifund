import { Database } from '@/db/database.types'
import { getUser } from '@/db/profile'
import { listProjectsForEvals } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'
import { TierList } from './tier-list'

export default async function EvalsPage() {
  const supabase = createServerClient()
  const [user, projects] = await Promise.all([
    getUser(supabase),
    listProjectsForEvals(supabase),
  ])
  if (!user) {
    return <div>Not logged in</div>
  }
  const evals = await getEvals(user.id, supabase)
  return (
    <div className="p-4">
      <TierList projects={projects} evals={evals} />
    </div>
  )
}

export type ProjectEval = Database['public']['Tables']['project_evals']['Row']
async function getEvals(userId: string, supabase: SupabaseClient) {
  const { data: evals, error } = await supabase
    .from('project_evals')
    .select('*')
    .eq('evaluator_id', userId)
  if (error) {
    throw error
  }
  return evals as ProjectEval[]
}
