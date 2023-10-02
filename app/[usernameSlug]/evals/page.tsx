import { createServerClient } from '@/db/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'
import { getProfileByUsername, getUser } from '@/db/profile'
import { Project } from '@/db/project'
import Link from 'next/link'
import { Col } from '@/components/layout/col'
import { ProfileTrust, ProjectEval } from '@/app/evals-form/page'
import { ArrowLongRightIcon } from '@heroicons/react/20/solid'

type Result = {
  id: string
  insideScore: number
  confidence: number
  trustScores: Record<string, number>
  outsideScore: number
  overallScore: number
}

export default async function ResultsPage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createServerClient()
  const evaluator = await getProfileByUsername(supabase, usernameSlug)
  if (!evaluator) {
    return <div>User not found</div>
  }
  const user = await getUser(supabase)
  const evals = await getAllEvals(supabase)
  const profileTrusts = await getAllProfileTrusts(supabase)
  const userEvals = evals.filter((e) => e.evaluator_id === evaluator.id)
  const projects = await getSelectProjects(
    supabase,
    userEvals.map((e) => e.project_id)
  )
  const resultRows = userEvals.map((evalItem) => {
    const thisProjectEvals = evals.filter(
      (e) => e.project_id === evalItem.project_id
    )
    const thisProjectProfileTrusts = profileTrusts.filter(
      (t) =>
        thisProjectEvals.find((e) => e.evaluator_id === t.trusted_id) &&
        thisProjectEvals.find((e) => e.evaluator_id === t.truster_id)
    )
    return (
      <ResultRow
        key={evalItem.project_id}
        project={projects.find((p) => p.id === evalItem.project_id)}
        evals={thisProjectEvals}
        trusts={thisProjectProfileTrusts}
        evaluatorId={evaluator.id}
      />
    )
  })
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{evaluator.full_name}&apos;s evals</h1>
      <Col className="divide-y divide-gray-200">
        <div className="grid grid-cols-7 gap-2 py-2 text-sm text-gray-600">
          <p className="col-span-3">Project</p>
          <p>Inside</p>
          <p>Outside</p>
          <p>Conf</p>
          <p>Overall</p>
        </div>
        {resultRows}
      </Col>
      <Link
        href={user ? '/evals-form' : '/login'}
        className="mt-10 flex items-center justify-end gap-1 text-sm font-semibold text-orange-600"
      >
        {user ? 'My evals form' : 'Log in to add my evals'}
        <ArrowLongRightIcon className="h-5 w-5 stroke-2" />
      </Link>
    </div>
  )
}

function ResultRow(props: {
  project: Project
  evals: ProjectEval[]
  trusts: ProfileTrust[]
  evaluatorId: string
}) {
  const { evals, trusts, evaluatorId, project } = props
  const resultsArr = makeResultsArraySingleProject(evals, trusts)
  const thisUserResult = resultsArr.find((i) => i.id === evaluatorId)
  if (!thisUserResult) {
    return <div>Something went wrong</div>
  } else if (evals.length === 1) {
    thisUserResult.outsideScore = NaN
    thisUserResult.overallScore = thisUserResult.insideScore
  } else {
    resultsArr.forEach((item) => {
      const otherEvals = resultsArr.filter((i) => i.id !== item.id)
      item.outsideScore =
        otherEvals.reduce((acc, i) => acc + i.insideScore, 0) /
        otherEvals.length
      item.overallScore =
        item.insideScore * item.confidence +
        item.outsideScore * (1 - item.confidence)
    })
    for (let i = 0; i < 100; i++) {
      resultsArr.forEach((item) => {
        const otherEvals = resultsArr.filter((i) => i.id !== item.id)
        item.outsideScore = otherEvals.reduce(
          (acc, i) => acc + i.overallScore * item.trustScores[i.id],
          0
        )
        item.overallScore =
          item.insideScore * item.confidence +
          item.outsideScore * (1 - item.confidence)
      })
    }
  }
  return (
    <div className="grid grid-cols-7 gap-4 py-2 text-sm">
      <Link
        className="line-clamp-1 col-span-3 hover:underline"
        href={`/projects/${project.slug}`}
      >
        {project.title}
      </Link>
      <p>{Math.round(thisUserResult.insideScore * 10) / 10}</p>
      <p>
        {isNaN(thisUserResult.outsideScore)
          ? 'N/A'
          : Math.round(thisUserResult.outsideScore * 10) / 10}
      </p>
      <p>{Math.round(thisUserResult.confidence * 10) / 10}</p>
      <p className="font-bold">
        {Math.round(thisUserResult.overallScore * 10) / 10}
      </p>
    </div>
  )
}

function makeResultsArraySingleProject(
  evals: ProjectEval[],
  trusts: ProfileTrust[]
) {
  const results = [] as Result[]
  evals.forEach((evalItem) => {
    const trustScores = genTrustScoresSingleProject(evals, trusts, evalItem)
    results.push({
      id: evalItem.evaluator_id,
      insideScore: evalItem.score,
      confidence: evalItem.confidence,
      trustScores,
      outsideScore: 0,
      overallScore: 0,
    })
  })
  return results
}

function genTrustScoresSingleProject(
  evals: ProjectEval[],
  trusts: ProfileTrust[],
  currEval: ProjectEval
) {
  const currEvaluatorTrusts = trusts.filter(
    (t) => t.truster_id === currEval.evaluator_id
  )
  const trustScores = Object.fromEntries(
    currEvaluatorTrusts.map((t) => [t.trusted_id, t.weight])
  )
  evals.forEach((evalItem) => {
    if (evalItem.evaluator_id === currEval.evaluator_id) {
      trustScores[evalItem.evaluator_id] = 0
    } else if (!trustScores[evalItem.evaluator_id]) {
      trustScores[evalItem.evaluator_id] = 1
    }
  })
  const total = Object.values(trustScores).reduce((acc, i) => acc + i, 0)
  return Object.fromEntries(
    Object.entries(trustScores).map(([key, value]) => [
      key,
      total === 0 ? value : value / total,
    ])
  )
}

async function getAllEvals(supabase: SupabaseClient) {
  const { data: evals, error } = await supabase
    .from('project_evals')
    .select('*')
  if (error) {
    throw error
  }
  return evals as ProjectEval[]
}

async function getAllProfileTrusts(supabase: SupabaseClient) {
  const { data: profileTrusts, error } = await supabase
    .from('profile_trust')
    .select('*')
  if (error) {
    throw error
  }
  return profileTrusts as ProfileTrust[]
}

async function getSelectProjects(
  supabase: SupabaseClient,
  projectIds: string[]
) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds)
  if (error) {
    throw error
  }
  return projects
}
