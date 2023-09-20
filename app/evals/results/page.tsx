type Eval = {
  id: number
  insideScore: number
  confidence: number
  trustScores: Record<number, number>
  outsideScore: number
  overallScore: number
}

const EVALS = [
  {
    id: 1,
    insideScore: 5,
    confidence: 0.8,
    trustScores: { 1: 0, 2: 0.5, 3: 0.5 },
    outsideScore: 0,
    overallScore: 0,
  },
  {
    id: 2,
    insideScore: 1,
    confidence: 0.5,
    trustScores: { 1: 0.9, 2: 0, 3: 0.1 },
    outsideScore: 0,
    overallScore: 0,
  },
  {
    id: 3,
    insideScore: 3,
    confidence: 0.2,
    trustScores: { 1: 0.2, 2: 0.8, 3: 0 },
    outsideScore: 0,
    overallScore: 0,
  },
] as Eval[]

export default function ResultsPage() {
  EVALS.forEach((item) => {
    const otherEvals = EVALS.filter((i) => i.id !== item.id)
    item.outsideScore =
      otherEvals.reduce((acc, i) => acc + i.insideScore, 0) / otherEvals.length
    item.overallScore =
      item.insideScore * item.confidence +
      item.outsideScore * (1 - item.confidence)
  })
  for (let i = 0; i < 100; i++) {
    EVALS.forEach((item) => {
      const otherEvals = EVALS.filter((i) => i.id !== item.id)
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
      {EVALS.map((item) => {
        return <p key={item.id}>{item.overallScore}</p>
      })}
    </div>
  )
}
