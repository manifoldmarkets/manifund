import { FullProject } from '@/db/project'
import { calculateAmountRaised } from '@/utils/math'

export function hotScore(project: FullProject) {
  // Factors:
  // Time in days since project was created
  let time = Date.now() - new Date(project.created_at).getTime()
  time = time / (1000 * 60 * 60 * 24)

  const votes = countVotes(project)
  const comments = project.comments.length
  const raised = calculateAmountRaised(project, project.bids, project.txns)

  const points = votes * 2 + comments + Math.log(raised + 1) * 3
  // Hacker News newness algorithm: https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
  // Note that we use days instead of hours, and modify the constants a bit
  const score = (points + 2) / time ** 1.8

  return -score
}

export const countVotes = (project: FullProject) =>
  project.project_votes.reduce((acc, vote) => acc + vote.magnitude, 0)
