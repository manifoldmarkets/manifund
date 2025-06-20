import { SupabaseClient } from '@supabase/supabase-js'
import { FullProject } from '@/db/project'
import { sendEmail } from './email'
import { pointScore } from './sort'

/* TODOs:
- [ ] Pull out regrantor (or all) emails from Supabase
- [ ] Send out batch emails on batch endpoint
- [x] Sort by "great" score
*/

// Hardcoded email list for now
const DIGEST_RECIPIENTS = [
  'austin@manifund.org',
  // Add more emails here as needed
]

export async function getNewProjectsLastWeek(
  supabase: SupabaseClient
): Promise<FullProject[]> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: projectsBase } = await supabase
    .from('projects')
    .select(
      `
      *,
      profiles!projects_creator_fkey(*),
      rounds(title, slug),
      causes(title, slug)
    `
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .throwOnError()

  if (!projectsBase || projectsBase.length === 0) {
    return []
  }

  const projectIds = projectsBase.map((p) => p.id)

  // Get related data for these projects
  const [votes, comments, bids, txns] = await Promise.all([
    supabase
      .from('project_votes')
      .select('project_id, magnitude')
      .in('project_id', projectIds),
    supabase.from('comments').select('project, id').in('project', projectIds),
    supabase.from('bids').select('*').in('project', projectIds),
    supabase.from('txns').select('*').in('project', projectIds),
  ])

  // Process the data
  const projects: FullProject[] = projectsBase.map((project) => {
    const projectVotes =
      votes.data?.filter((v) => v.project_id === project.id) || []
    const projectComments =
      comments.data?.filter((c) => c.project === project.id) || []
    const projectBids = bids.data?.filter((b) => b.project === project.id) || []
    const projectTxns = txns.data?.filter((t) => t.project === project.id) || []

    return {
      ...project,
      project_votes: projectVotes,
      comments: projectComments,
      bids: projectBids,
      txns: projectTxns,
      project_transfers: [],
      project_follows: [],
    }
  })

  // Sort by pointScore (highest first)
  return projects.sort((a, b) => pointScore(b) - pointScore(a))
}

function countProjectVotes(project: FullProject): number {
  return project.project_votes.reduce((acc, vote) => acc + vote.magnitude, 0)
}

export function generateProjectListHtml(projects: FullProject[]): string {
  return projects
    .map((project) => {
      const upvotes = countProjectVotes(project)
      const commentCount = project.comments.length
      const creatorName =
        project.profiles?.full_name || project.profiles?.username || 'Anonymous'
      const summary = project.blurb || 'No description available'

      return `
      <div class="project-item">
        <div class="project-title"><a href="https://manifund.org/projects/${escapeHtml(
          project.slug
        )}">${escapeHtml(project.title)}</a></div>
        <div class="project-creator">by ${escapeHtml(creatorName)}</div>
        <div class="project-summary">${escapeHtml(summary)}</div>
        <div class="project-stats">
          <span class="stats-item">${upvotes} ⬆️</span>
          <span class="stats-item">${commentCount} 💬</span>
          <span class="stats-item">💰 $${project.funding_goal}</span>
        </div>
      </div>
    `
    })
    .join('')
}

export function formatWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(now.getDate() - 7)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  return {
    weekStart: oneWeekAgo.toLocaleDateString('en-US', options),
    weekEnd: now.toLocaleDateString('en-US', options),
  }
}

export function generatePlaintextDigest(projects: FullProject[]): string {
  const { weekStart, weekEnd } = formatWeekRange()

  let text = `Manifund: New projects weekly\n${weekStart} - ${weekEnd}\n\n`

  if (projects.length === 0) {
    text += 'No new projects were created this week.\n'
  } else {
    text += 'New projects this week:\n\n'
    projects.forEach((project) => {
      const upvotes = countProjectVotes(project)
      const commentCount = project.comments.length
      const creatorName =
        project.profiles?.full_name || project.profiles?.username || 'Anonymous'
      const summary = project.blurb || 'No description available'

      text += `- ${project.title}, by ${creatorName} - ${summary}. ${upvotes} ⬆️ ${commentCount} 💬\n`
    })
  }

  return text
}

export function generateHtmlDigest(projects: FullProject[]): string {
  const { weekStart, weekEnd } = formatWeekRange()
  const projectListHtml =
    projects.length > 0 ? generateProjectListHtml(projects) : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manifund: New projects weekly - Manifund</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #7f8c8d;
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .project-list {
            margin: 20px 0;
        }
        .project-item {
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        .project-item:last-child {
            border-bottom: none;
        }
        .project-title {
            font-weight: bold;
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .project-title a {
            color: #ea580c;
            text-decoration: underline;
            font-weight: bold;
        }
        .project-creator {
            color: #7f8c8d;
            font-weight: 500;
        }
        .project-summary {
            color: #555;
            margin: 8px 0;
            font-size: 14px;
        }
        .project-stats {
            font-size: 13px;
            color: #7f8c8d;
            margin-top: 8px;
        }
        .stats-item {
            display: inline-block;
            margin-right: 15px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        .footer a {
            color: #3498db;
            text-decoration: none;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #ea580c;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .no-projects {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Manifund: New projects weekly</h1>
            <p>${weekStart} - ${weekEnd}</p>
        </div>

        ${
          projects.length > 0
            ? `
        <div class="project-list">
            ${projectListHtml}
        </div>
        
        <div style="text-align: center;">
            <a href="https://manifund.org/projects" class="cta-button">Browse All Projects</a>
        </div>
        `
            : `
        <div class="no-projects">
            No new projects were created this week.
        </div>
        `
        }

        <div class="footer">
            <p>This digest includes all new projects listed on <a href="https://manifund.org">Manifund</a> in the past week.</p>
        </div>
    </div>
</body>
</html>
  `
}

export async function sendWeeklyDigest(
  supabase: SupabaseClient
): Promise<void> {
  console.log('Starting weekly digest generation...')

  const projects = await getNewProjectsLastWeek(supabase)
  const { weekStart, weekEnd } = formatWeekRange()

  const subject = `Manifund: New projects weekly, from ${weekStart}`
  const htmlBody = generateHtmlDigest(projects)
  const textBody = generatePlaintextDigest(projects)

  console.log(`Found ${projects.length} new projects for weekly digest`)

  // Send to all recipients
  for (const email of DIGEST_RECIPIENTS) {
    try {
      await sendEmail(
        email,
        subject,
        htmlBody,
        textBody,
        'Manifund Digest <digest@manifund.org>',
        'outbound'
      )
      console.log(`Weekly digest sent to ${email}`)
    } catch (error) {
      console.error(`Failed to send weekly digest to ${email}:`, error)
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
