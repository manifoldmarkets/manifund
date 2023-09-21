import { Database } from '@/db/database.types'
import { listProfilesAndEvals, getUser } from '@/db/profile'
import { listProjectsForEvals } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Evals } from './evals'

export default async function EvalsPage() {
  const supabase = createServerClient()
  const [user, projects, profiles] = await Promise.all([
    getUser(supabase),
    listProjectsForEvals(supabase),
    listProfilesAndEvals(supabase),
  ])
  if (!user) {
    return <div>Not logged in</div>
  }
  const evals = await getEvals(user.id, supabase)
  return (
    <div className="p-4">
      <Evals projects={projects} evals={evals} profiles={profiles} />
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
