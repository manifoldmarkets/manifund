import { createAdminClient } from '@/db/edge'
import { getRegranters } from '@/db/profile'
import * as fs from 'fs'
import * as path from 'path'

// Minimal recursive Tiptap → plaintext (mirrors app/about/regranting-data/page.tsx).
function tiptapToText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.type === 'text') return node.text ?? ''
  if (Array.isArray(node.content)) {
    return node.content.map(tiptapToText).join(' ')
  }
  return ''
}

async function exportRegrants() {
  const supabase = createAdminClient()

  const regrantors = await getRegranters(supabase)
  const regrantorIds = regrantors.map((r) => r.id)
  const regrantorMap = Object.fromEntries(regrantors.map((r) => [r.id, r]))
  console.log(`Found ${regrantors.length} regrantors`)

  const { data: grantTxns } = await supabase
    .from('txns')
    .select(
      'id, amount, created_at, from_id, to_id, project, projects(id, title, slug, type, stage, blurb, creator)'
    )
    .in('from_id', regrantorIds)
    .eq('type', 'project donation')
    .eq('token', 'USD')
    .not('project', 'is', null)
    .order('created_at', { ascending: false })
    .throwOnError()

  const validTxns = (grantTxns ?? []).filter(
    (t: any) => t.projects && t.projects.type === 'grant' && t.projects.stage !== 'hidden'
  )
  console.log(`Found ${validTxns.length} regrants`)

  const projectIds = Array.from(new Set(validTxns.map((t: any) => t.project as string)))

  // Regrantor comments on these projects (used as grant explanations).
  const { data: regrantorComments } = projectIds.length
    ? await supabase
        .from('comments')
        .select('id, project, commenter, content, created_at')
        .in('commenter', regrantorIds)
        .in('project', projectIds)
        .order('created_at', { ascending: true })
        .throwOnError()
    : { data: [] }

  const commentByKey: Record<string, string> = {}
  for (const c of regrantorComments ?? []) {
    const key = `${c.commenter}::${c.project}`
    const text = tiptapToText(c.content).trim()
    if (!text || text.length < 40) continue
    if (!commentByKey[key]) commentByKey[key] = text
  }

  const rows = validTxns.map((t: any) => {
    const r = regrantorMap[t.from_id as string]
    const proj = t.projects
    return {
      date: (t.created_at as string).slice(0, 10),
      regrantor_name: r?.full_name ?? 'Unknown',
      regrantor_username: r?.username ?? '',
      regrantor_id: t.from_id as string,
      amount: t.amount as number,
      project_title: proj?.title ?? 'Untitled',
      project_slug: proj?.slug ?? '',
      project_url: proj?.slug ? `https://manifund.org/projects/${proj.slug}` : '',
      project_id: t.project as string,
      comment: commentByKey[`${t.from_id}::${t.project}`] ?? '',
      txn_id: t.id as string,
    }
  })

  const headers = [
    'Date',
    'Regrantor Name',
    'Regrantor Username',
    'Regrantor ID',
    'Amount (USD)',
    'Project Title',
    'Project Slug',
    'Project URL',
    'Project ID',
    'Comment',
    'Txn ID',
  ]
  const csvRows = rows.map((row) =>
    [
      row.date,
      row.regrantor_name,
      row.regrantor_username,
      row.regrantor_id,
      row.amount.toString(),
      row.project_title,
      row.project_slug,
      row.project_url,
      row.project_id,
      row.comment,
      row.txn_id,
    ]
      .map(escapeCsvField)
      .join(',')
  )

  const csvContent = headers.join(',') + '\n' + csvRows.join('\n') + '\n'
  const outputPath = path.join(__dirname, 'regrants.csv')
  fs.writeFileSync(outputPath, csvContent, 'utf-8')

  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  console.log(`\nExport complete!`)
  console.log(`Output written to: ${outputPath}`)
  console.log(`Total regrants: ${rows.length}`)
  console.log(`Total amount: $${total.toLocaleString()}`)
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

exportRegrants().catch((error) => {
  console.error('Failed to export regrants:', error)
  process.exit(1)
})
