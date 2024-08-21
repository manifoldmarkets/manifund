import { listProfilesAndEvals, getUser } from '@/db/profile'
import { listProjectsForEvals } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { EvalsForm } from './evals-form'
import { getProfileTrusts, getUserEvals } from '@/db/eval'
import { sortBy } from 'lodash'
import Auth from '@/app/login/auth-ui'

export default async function EvalsPage() {
  const supabase = createServerClient()
  const [user, projects, profiles] = await Promise.all([
    getUser(supabase),
    listProjectsForEvals(supabase),
    listProfilesAndEvals(supabase),
  ])
  if (!user) {
    return <Auth />
  }
  const [evals, profileTrusts] = await Promise.all([
    getUserEvals(user.id, supabase),
    getProfileTrusts(user.id, supabase),
  ])
  const username = profiles.find((p) => p.id === user.id)?.username
  const sortedProjects = sortBy(projects, (p) => {
    if (p.stage === 'active') {
      return 0
    } else {
      return 1
    }
  })
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        Grant evaluation form (experimental)
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Anyone on Manifund can fill out this form! Score grants Manifund has
        given or passed on. When you&apos;re done, you&apos;ll be able to see
        where these projects stack up, taking into account your confidence in
        each of your ratings, your trust in other evaluators, and their
        evaluations.{' '}
        <a
          href="https://manifoldmarkets.notion.site/EigenEvals-Info-78683c6099fc40bc8c8b58f832afbbee?pvs=4"
          className="text-orange-600 hover:underline"
        >
          Here&apos;s
        </a>{' '}
        more info on how the scoring calculations work.{' '}
        <strong>Note that your evaluations are public.</strong>
      </p>
      {username && (
        <EvalsForm
          projects={sortedProjects}
          evals={evals}
          profiles={profiles}
          profileTrusts={profileTrusts}
          username={username}
        />
      )}
    </div>
  )
}
