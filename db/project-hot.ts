import { SupabaseClient } from '@supabase/supabase-js'
import { FullProject, listProjects } from './project'
import { countVotes, hotScore } from '@/utils/sort'
import { getAmountRaised } from '@/utils/math'

export async function getHotProjects(
  supabase: SupabaseClient,
  limit: number = 20
): Promise<FullProject[]> {
  const { data: projectsWithStats } = await supabase
    .from('projects')
    .select(
      `
      *,
      profiles!projects_creator_fkey(*),
      rounds(title, slug),
      causes(title, slug),
      project_votes!left(magnitude),
      comments!left(id),
      bids!left(amount, status),
      txns!left(amount, type)
    `
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .throwOnError()
  if (!projectsWithStats || projectsWithStats.length === 0) {
    return []
  }

  // Calculate hot scores for all projects
  const projectsWithScores = projectsWithStats.map((project) => {
    const voteTotal = countVotes(project)
    const commentCount = project.comments?.length || 0
    const totalRaised = getAmountRaised(project, project.bids, project.txns)
    // minimal FullProject object with just the data needed for scoring
    const tempFullProject: FullProject = {
      ...project,
      bids: totalRaised > 0 ? [] : [],
      txns: totalRaised > 0 ? ([{ amount: totalRaised }] as any) : [],
      comments: Array(commentCount).fill({ id: '' }),
      project_votes:
        voteTotal > 0
          ? ([{ project_id: project.id, magnitude: voteTotal }] as any)
          : [],
      project_transfers: [],
      project_follows: [],
    }

    return {
      project: tempFullProject,
      score: hotScore(tempFullProject),
    }
  })

  projectsWithScores.sort((a, b) => a.score - b.score)
  const topProjects = projectsWithScores.slice(0, limit)
  const topProjectIds = topProjects.map((p) => p.project.id)
  const fullProjects = await listProjects(supabase, topProjectIds)
  return fullProjects
}
