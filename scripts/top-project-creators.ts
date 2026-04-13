import { createAdminClient } from '@/db/edge'
import { getAmountRaised } from '@/utils/math'
import { pointScore, countVotes } from '@/utils/sort'

async function main() {
  const supabase = createAdminClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
      id, title, blurb, creator, created_at, stage, type, funding_goal,
      profiles!projects_creator_fkey(id, full_name, username),
      project_votes(magnitude),
      comments(id),
      bids(amount, status, type),
      txns(amount, type, token, to_id)
    `
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .throwOnError()

  if (error || !projects) {
    console.error('Failed to fetch projects:', error)
    process.exit(1)
  }

  const scored = projects.map((p) => {
    const fp = p as any
    const votes = countVotes(fp)
    const commentCount = (p.comments ?? []).length
    const raised = getAmountRaised(fp, fp.bids, fp.txns)
    const score = pointScore(fp)

    return {
      title: p.title,
      blurb: p.blurb || '',
      creatorId: p.creator,
      creatorName: p.profiles?.full_name || p.profiles?.username || 'Unknown',
      votes,
      comments: commentCount,
      raised,
      score,
    }
  })

  // Sort by score descending, take top 100
  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 1000)

  // Print results
  console.log('Rank | Score | Votes | Comments | Raised | Creator | Project | Blurb')
  console.log('-----|-------|-------|----------|--------|---------|---------|------')
  top.forEach((p, i) => {
    const raised = `$${Math.round(p.raised).toLocaleString()}`
    console.log(
      `${String(i + 1).padStart(4)} | ${p.score.toFixed(1).padStart(5)} | ${String(p.votes).padStart(5)} | ${String(p.comments).padStart(8)} | ${raised.padStart(6)} | ${p.creatorName} | ${p.title} | ${p.blurb}`
    )
  })
}

void main()
