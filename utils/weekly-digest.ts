import { SupabaseClient } from '@supabase/supabase-js'
import { FullProject } from '@/db/project'
import { sendEmail, sendBatchEmail } from './email'
import { pointScore } from './sort'
import { getAmountRaised } from './math'
import { getUserEmail } from './email'
import { getSponsoredAmount } from './constants'
import { toPlaintext } from './tiptap-parsing'

/* TODOs:
- [x] Pull out regrantor emails from Supabase
- [x] Sort by "great" score
- [x] Add comments section with regrantor comments and top emoji reactions
- [x] Pull out large donor emails from Supabase
- [x] Send out batch emails on batch endpoint
- [ ] Prettify email, rename
- [ ] Simplify code & payload
*/

// Hardcoded email list for now
const DEFAULT_DIGEST_RECIPIENTS = [
  'austin@manifund.org',
  'akrolsmir@gmail.com',
  // 'rachel.weinberg12@gmail.com',
  // Add more emails here as needed
]

export async function getRegrantorEmails(
  supabase: SupabaseClient,
  year?: number
): Promise<string[]> {
  // Get all regrantors from profiles table
  const { data: regrantors } = await supabase
    .from('profiles')
    .select('id')
    .eq('regranter_status', true)
    .throwOnError()

  if (!regrantors || regrantors.length === 0) {
    return []
  }

  // Filter regrantors by year if specified
  const filteredRegrantors = year
    ? regrantors.filter(
        (regrantor) => getSponsoredAmount(regrantor.id, year) > 0
      )
    : regrantors

  // Get emails for each regrantor
  const emails = await Promise.all(
    filteredRegrantors.map(async (regrantor) => {
      const email = await getUserEmail(supabase, regrantor.id)
      return email
    })
  )

  // Filter out null emails and return unique emails
  return Array.from(
    new Set(emails.filter((email): email is string => email !== null))
  )
}

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
      const raised = getAmountRaised(project, project.bids, project.txns)

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
          <span class="stats-item">💰 $${raised} / ${
        project.funding_goal
      }</span>
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

export async function getNotableCommentsLastWeek(
  supabase: SupabaseClient,
  limit: number = 15
): Promise<any[]> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Get all regrantors for bonus scoring
  const { data: regrantors } = await supabase
    .from('profiles')
    .select('id')
    .eq('regranter_status', true)
    .throwOnError()

  const regrantorIds = new Set(regrantors?.map((r) => r.id) || [])

  // Get all comments from the last week with their reactions
  const { data: comments } = await supabase
    .from('comments')
    .select(
      `
      *,
      profiles!comments_commenter_fkey(id, username, full_name, avatar_url),
      projects(id, title, slug, stage),
      comment_rxns(reactor_id, reaction)
    `
    )
    .gte('created_at', oneWeekAgo.toISOString())
    .neq('projects.stage', 'hidden')
    .order('created_at', { ascending: false })
    .throwOnError()

  if (!comments || comments.length === 0) {
    return []
  }

  // Calculate reaction scores for each comment
  const commentsWithScores = comments.map((comment) => {
    const reactions = comment.comment_rxns || []
    const reactionCounts: { [key: string]: number } = {}

    reactions.forEach((rxn: any) => {
      reactionCounts[rxn.reaction] = (reactionCounts[rxn.reaction] || 0) + 1
    })

    // Calculate total score (simple sum of all reactions)
    const baseScore = Object.values(reactionCounts).reduce(
      (sum, count) => sum + (count as number),
      0
    )

    // Add +2 bonus for regrantors
    const REGRANTOR_BONUS = 2
    const isRegrantor = regrantorIds.has(comment.commenter)
    const totalScore = baseScore + (isRegrantor ? REGRANTOR_BONUS : 0)

    return {
      ...comment,
      reactionCounts,
      baseScore,
      totalScore,
      isRegrantor,
    }
  })

  // Sort by total score and return top comments
  return commentsWithScores
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
}

export function generateCommentsSectionHtml(notableComments: any[]): string {
  if (notableComments.length === 0) {
    return ''
  }

  let html = `
    <div class="comments-section">
      <div class="section-header">
        <h2>Notable Comments</h2>
      </div>
      <div class="comments-list">
  `

  notableComments.forEach((comment) => {
    const commenterName =
      comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'
    const projectTitle = comment.projects?.title || 'Unknown Project'
    const projectSlug = comment.projects?.slug || ''
    let commentText = toPlaintext(comment.content)
    // If > 280 chars, trim down and add ellipsis
    if (commentText.length > 360) {
      commentText = commentText.substring(0, 360) + '...'
    }
    const reactionHtml = Object.entries(comment.reactionCounts)
      .map(([emoji, count]) => `${emoji}${(count as number) > 1 ? count : ''}`)
      .join(' ')

    html += `
      <div class="comment-item">
        <div class="comment-header">
          <span class="commenter-name">${escapeHtml(commenterName)}${
      comment.isRegrantor ? ' ⭐️' : ''
    }</span>
          <span class="comment-project">on <a href="https://manifund.org/projects/${escapeHtml(
            projectSlug
          )}">${escapeHtml(projectTitle)}</a></span>
        </div>
        <div class="comment-content">${escapeHtml(commentText)}</div>
        ${
          reactionHtml
            ? `<div class="comment-reactions">${reactionHtml}</div>`
            : ''
        }
      </div>
    `
  })

  html += `
      </div>
    </div>
  `
  return html
}

export function generatePlaintextCommentsSection(
  notableComments: any[]
): string {
  if (notableComments.length === 0) {
    return ''
  }

  let text = '\nNotable comments this week:\n\n'

  notableComments.forEach((comment) => {
    const commenterName =
      comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'
    const projectTitle = comment.projects?.title || 'Unknown Project'
    const commentText =
      comment.content?.content?.[0]?.content?.[0]?.text || 'No content'
    const reactionText = Object.entries(comment.reactionCounts)
      .map(([emoji, count]) => `${emoji}${(count as number) > 1 ? count : ''}`)
      .join(' ')

    text += `- ${commenterName}${
      comment.isRegrantor ? ' ⭐️' : ''
    } on "${projectTitle}": ${commentText} ${reactionText}\n`
  })

  return text
}

export function generateHtmlDigest(
  projects: FullProject[],
  notableComments: any[] = [],
  notableGrants: any[] = []
): string {
  const { weekStart, weekEnd } = formatWeekRange()
  const projectListHtml =
    projects.length > 0 ? generateProjectListHtml(projects) : ''
  const commentsSectionHtml = generateCommentsSectionHtml(notableComments)
  const grantsSectionHtml = generateGrantsSectionHtml(notableGrants)

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
        .comments-section {
            margin: 30px 0;
        }
        .grants-section {
            margin: 30px 0;
        }
        .section-header {
            margin: 25px 0 15px 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .section-header h2 {
            color: #2c3e50;
            margin: 0;
            font-size: 20px;
        }
        .section-header p {
            color: #7f8c8d;
            margin: 5px 0 0 0;
            font-size: 12px;
        }
        .comments-list {
            margin: 15px 0;
        }
        .grants-list {
            margin: 15px 0;
        }
        .comment-item {
            padding: 12px 0;
        }
        .comment-item:last-child {
            border-bottom: none;
        }
        .grant-item {
            padding: 12px 0;
        }
        .grant-item:last-child {
            border-bottom: none;
        }
        .comment-header {
            font-size: 13px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        .commenter-name {
            font-weight: 600;
            color: #2c3e50;
        }
        .bidder-name {
            font-weight: 600;
            color: #2c3e50;
        }
        .comment-project a {
            color: #ea580c;
            text-decoration: underline;
        }
        .grant-project a {
            color: #ea580c;
            text-decoration: underline;
        }
        .comment-score {
            color: #27ae60;
            font-weight: 500;
        }
        .comment-content {
            color: #555;
            font-size: 14px;
            margin: 5px 0;
        }
        .grant-content {
            color: #555;
            font-size: 14px;
            margin: 5px 0;
        }
        .comment-reactions {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
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

        ${commentsSectionHtml}

        ${grantsSectionHtml}

        <div class="footer">
            <p>Not interested? <a href="{{{ pm:unsubscribe }}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
  `
}

export function generatePlaintextDigest(
  projects: FullProject[],
  notableComments: any[] = [],
  notableGrants: any[] = []
): string {
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

  text += generatePlaintextCommentsSection(notableComments)
  text += generatePlaintextGrantsSection(notableGrants)

  return text
}

export async function sendWeeklyDigest(
  supabase: SupabaseClient
): Promise<void> {
  console.log('Starting weekly digest generation...')

  const projects = await getNewProjectsLastWeek(supabase)
  const notableComments = await getNotableCommentsLastWeek(supabase, 15)
  const notableGrants = await getNotableGrantsLastWeek(supabase, 15)
  const { weekStart, weekEnd } = formatWeekRange()

  const subject = `Manifund: New projects weekly, from ${weekStart}`
  const htmlBody = generateHtmlDigest(projects, notableComments, notableGrants)
  const textBody = generatePlaintextDigest(
    projects,
    notableComments,
    notableGrants
  )

  console.log(`Found ${projects.length} new projects for weekly digest`)
  console.log(`Found ${notableComments.length} notable comments`)
  console.log(`Found ${notableGrants.length} notable grants`)

  const recipients = [
    ...DEFAULT_DIGEST_RECIPIENTS,
    // ...(await getRegrantorEmails(supabase, 2025)),
    // ...(await getLargeDonorsEmails(supabase, 1000)),
  ]

  // Prepare batch email payload
  const uniqueRecipients = new Set(recipients)
  const batchEmails = Array.from(uniqueRecipients).map((email) => ({
    toEmail: email,
    subject,
    htmlBody,
    textBody,
    fromEmail: 'Manifund Digest <digest@manifund.org>',
    messageStream: 'outbound' as const,
  }))

  // Send batch email
  try {
    await sendBatchEmail(batchEmails)
    console.log(
      `Weekly digest sent to ${recipients.length} recipients via batch API`
    )
  } catch (error) {
    console.error('Failed to send weekly digest batch:', error)
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

export async function getNotableGrantsLastWeek(
  supabase: SupabaseClient,
  limit: number = 15
): Promise<any[]> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Get all regrantors for identification
  const { data: regrantors } = await supabase
    .from('profiles')
    .select('id')
    .eq('regranter_status', true)
    .throwOnError()

  const regrantorIds = new Set(regrantors?.map((r) => r.id) || [])

  // Get all bids from the last week
  const { data: bids } = await supabase
    .from('bids')
    .select(
      `
      *,
      profiles!bids_bidder_fkey(id, username, full_name, avatar_url),
      projects(id, title, slug, stage)
    `
    )
    .gte('created_at', oneWeekAgo.toISOString())
    .neq('projects.stage', 'hidden')
    .order('created_at', { ascending: false })
    .throwOnError()

  if (!bids || bids.length === 0) {
    return []
  }

  // Filter for notable bids: $1k+ or made by regrantors
  const notableBids = bids.filter((bid) => {
    const isRegrantor = regrantorIds.has(bid.bidder)
    const isLargeAmount = bid.amount >= 1000
    return isRegrantor || isLargeAmount
  })

  // Add regrantor flag and sort by amount (highest first)
  const bidsWithFlags = notableBids.map((bid) => ({
    ...bid,
    isRegrantor: regrantorIds.has(bid.bidder),
  }))

  return bidsWithFlags.sort((a, b) => b.amount - a.amount).slice(0, limit)
}

export function generateGrantsSectionHtml(notableGrants: any[]): string {
  if (notableGrants.length === 0) {
    return ''
  }

  let html = `
    <div class="grants-section">
      <div class="section-header">
        <h2>Notable Grants</h2>
      </div>
      <div class="grants-list">
  `

  notableGrants.forEach((grant) => {
    const bidderName =
      grant.profiles?.full_name || grant.profiles?.username || 'Anonymous'
    const projectTitle = grant.projects?.title || 'Unknown Project'
    const projectSlug = grant.projects?.slug || ''

    html += `
      <div class="grant-item">
        <div class="grant-content">
          <span class="bidder-name">${escapeHtml(bidderName)}${
      grant.isRegrantor ? ' ⭐️' : ''
    }</span>
          <span class="grant-text"> offered $${grant.amount.toLocaleString()} to </span>
          <span class="grant-project"><a href="https://manifund.org/projects/${escapeHtml(
            projectSlug
          )}">${escapeHtml(projectTitle)}</a></span>
        </div>
      </div>
    `
  })

  html += `
      </div>
    </div>
  `
  return html
}

export function generatePlaintextGrantsSection(notableGrants: any[]): string {
  if (notableGrants.length === 0) {
    return ''
  }

  let text = '\nNotable grants this week:\n\n'

  notableGrants.forEach((grant) => {
    const bidderName =
      grant.profiles?.full_name || grant.profiles?.username || 'Anonymous'
    const projectTitle = grant.projects?.title || 'Unknown Project'

    text += `- ${bidderName}${
      grant.isRegrantor ? ' ⭐️' : ''
    } offered $${grant.amount.toLocaleString()} to ${projectTitle}\n`
  })

  return text
}

export async function getLargeDonorsEmails(
  supabase: SupabaseClient,
  minAmount: number = 1000
): Promise<string[]> {
  // Get all USD transactions
  const { data: txns } = await supabase
    .from('txns')
    .select('*')
    .eq('token', 'USD')
    .eq('type', 'deposit')
    .throwOnError()

  if (!txns || txns.length === 0) {
    return []
  }

  // Calculate total donated per user (sum of deposit amounts)
  const donatedByUserId: Record<string, number> = {}
  txns.forEach((txn) => {
    donatedByUserId[txn.to_id] = (donatedByUserId[txn.to_id] || 0) + txn.amount
  })

  // Filter users who have donated at least minAmount
  const largeDonorIds = Object.entries(donatedByUserId)
    .filter(([_, amount]) => amount >= minAmount)
    .map(([userId, _]) => userId)

  if (largeDonorIds.length === 0) {
    return []
  }

  // Get profiles for these users to exclude regrantors
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .in('id', largeDonorIds)
    .eq('regranter_status', false)
    .throwOnError()

  if (!profiles || profiles.length === 0) {
    return []
  }

  // Get emails for each large donor
  const emails = await Promise.all(
    profiles.map(async (profile) => {
      const email = await getUserEmail(supabase, profile.id)
      return email
    })
  )

  // Filter out null emails and return unique emails
  return Array.from(
    new Set(emails.filter((email): email is string => email !== null))
  )
}
