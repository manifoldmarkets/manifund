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
  userEvals.forEach((evalItem) => {
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
  })
}

function calculateScore(
  evals: ProjectEval[],
  trusts: ProfileTrust[],
  userId: string
) {
  return 3
}

function makeSingleResultsObj(evals: ProjectEval[], trusts: ProfileTrust[]) {
  const results = [] as Result[]
  evals.forEach((evalItem) => {
    const currEvaluatorTrusts = trusts.filter(
      (t) => t.truster_id === evalItem.evaluator_id
    )
    const trustsSum = currEvaluatorTrusts.reduce((acc, t) => acc + t.weight, 0)
    const trustScores = Object.fromEntries(
      currEvaluatorTrusts.map((t) => [t.trusted_id, t.weight / trustsSum])
    )
    trustScores[evalItem.evaluator_id] = 0
    results.push({
      id: evalItem.project_id,
      insideScore: evalItem.score,
      confidence: evalItem.confidence,
      trustScores,
      outsideScore: 0,
      overallScore: 0,
    })
  })
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
