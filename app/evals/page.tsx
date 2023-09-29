import { Database } from '@/db/database.types'
import { listProfilesAndEvals, getUser } from '@/db/profile'
import { listProjectsForEvals } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Evals } from './evals'
import { SiteLink } from '@/components/site-link'

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
  const [evals, profileTrusts] = await Promise.all([
    getUserEvals(user.id, supabase),
    getProfileTrusts(user.id, supabase),
  ])
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Grant evaluations</h1>
      <p className="mt-1 text-sm text-gray-600">
        Anyone on Manifund can fill out this form! Score grants Manifund has
        given or passed on. When you&apos;re done, you&apos;ll be able to see
        where these projects stack up, taking into account your confidence in
        each of your ratings, your trust in other evaluators, and their
        evaluations.{' '}
        <a
          href="https://manifoldmarkets.notion.site/EigenEvals-Info-78683c6099fc40bc8c8b58f832afbbee?pvs=4"
          className="hover-underline text-orange-600"
        >
          Here&apos;s
        </a>{' '}
        more info on how the scoring calculations work.
      </p>
      <Evals
        projects={projects}
        evals={evals}
        profiles={profiles}
        profileTrusts={profileTrusts}
      />
    </div>
  )
}

export type ProjectEval = Database['public']['Tables']['project_evals']['Row']
async function getUserEvals(userId: string, supabase: SupabaseClient) {
  const { data: evals, error } = await supabase
    .from('project_evals')
    .select('*')
    .eq('evaluator_id', userId)
  if (error) {
    throw error
  }
  return evals as ProjectEval[]
}

export type ProfileTrust = Database['public']['Tables']['profile_trust']['Row']
async function getProfileTrusts(userId: string, supabase: SupabaseClient) {
  const { data: profileTrusts, error } = await supabase
    .from('profile_trust')
    .select('*')
    .eq('truster_id', userId)
  if (error) {
    throw error
  }
  return profileTrusts as ProfileTrust[]
}
