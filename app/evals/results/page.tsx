import { createServerClient } from '@/db/supabase-server'
import { ProfileTrust, ProjectEval } from '../page'
import { SupabaseClient } from '@supabase/supabase-js'
import { getUser } from '@/db/profile'

type Result = {
  id: string
  insideScore: number
  confidence: number
  trustScores: Record<string, number>
  outsideScore: number
  overallScore: number
}

const RESULTS = [
  {
    id: '1',
    insideScore: 5,
    confidence: 0.8,
    trustScores: { '1': 0, '2': 0.5, '3': 0.5 },
    outsideScore: 0,
    overallScore: 0,
  },
  {
    id: '2',
    insideScore: 1,
    confidence: 0.5,
    trustScores: { '1': 0.9, '2': 0, '3': 0.1 },
    outsideScore: 0,
    overallScore: 0,
  },
  {
    id: '3',
    insideScore: 3,
    confidence: 0.2,
    trustScores: { '1': 0.2, '2': 0.8, '3': 0 },
    outsideScore: 0,
    overallScore: 0,
  },
] as Result[]

export default function ResultsPage() {
  RESULTS.forEach((item) => {
    const otherEvals = RESULTS.filter((i) => i.id !== item.id)
    item.outsideScore =
      otherEvals.reduce((acc, i) => acc + i.insideScore, 0) / otherEvals.length
    item.overallScore =
      item.insideScore * item.confidence +
      item.outsideScore * (1 - item.confidence)
  })
  for (let i = 0; i < 100; i++) {
    RESULTS.forEach((item) => {
      const otherEvals = RESULTS.filter((i) => i.id !== item.id)
      item.outsideScore = otherEvals.reduce(
        (acc, i) => acc + i.overallScore * item.trustScores[i.id],
        0
      )
      item.overallScore =
        item.insideScore * item.confidence +
        item.outsideScore * (1 - item.confidence)
    })
  }
  return (
    <div className="p-10">
      <h1>Results</h1>
      {RESULTS.map((item) => {
        return <p key={item.id}>{item.overallScore}</p>
      })}
      {/* @ts-expect-error server component */}
      <RealResultsPage />
    </div>
  )
}

async function RealResultsPage() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user) {
    return <div>Not logged in</div>
  }
  const evals = await getAllEvals(supabase)
  const profileTrusts = await getAllProfileTrusts(supabase)
  const userEvals = evals.filter((e) => e.evaluator_id === user.id)
  const scores = [] as number[]
  userEvals.forEach((evalItem, index) => {
    const thisProjectEvals = evals.filter(
      (e) => e.project_id === evalItem.project_id
    )
    const thisProjectProfileTrusts = profileTrusts.filter(
      (t) =>
        thisProjectEvals.find((e) => e.evaluator_id === t.trusted_id) &&
        thisProjectEvals.find((e) => e.evaluator_id === t.truster_id)
    )
    const score = calculateScore(
      thisProjectEvals,
      thisProjectProfileTrusts,
      user.id
    )
    scores.push(score ?? 0)
  })
  return (
    <div>
      <h1>Real Results</h1>
      {scores.map((score) => {
        return <p key={score}>{score}</p>
      })}
    </div>
  )
}

function calculateScore(
  evals: ProjectEval[],
  trusts: ProfileTrust[],
  userId: string
) {
  const resultsArr = makeSingleResultsArray(evals, trusts)
  if (evals.length === 1) {
    return resultsArr[0].insideScore
  }
  resultsArr.forEach((item) => {
    const otherEvals = resultsArr.filter((i) => i.id !== item.id)
    item.outsideScore =
      otherEvals.reduce((acc, i) => acc + i.insideScore, 0) / otherEvals.length
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
  return resultsArr.find((i) => i.id === userId)?.overallScore
}

function makeSingleResultsArray(evals: ProjectEval[], trusts: ProfileTrust[]) {
  const results = [] as Result[]
  console.log('evals', evals)
  evals.forEach((evalItem) => {
    const trustScores = generateTrustScores(evals, trusts, evalItem)
    console.log('trustScores', trustScores)
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

function generateTrustScores(
  evals: ProjectEval[],
  trusts: ProfileTrust[],
  currEval: ProjectEval
) {
  const currEvaluatorTrusts = trusts.filter(
    (t) => t.truster_id === currEval.evaluator_id
  )
  console.log('currEvaluatorTrusts', currEvaluatorTrusts)
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
