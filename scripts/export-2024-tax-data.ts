import { createAdminClient } from '@/db/edge'
import * as fs from 'fs'
import * as path from 'path'

interface RecipientWithProjectsAndWithdrawals {
  project_titles: string
  project_ids: string
  project_locations: string
  creator_name: string
  creator_id: string
  total_withdrawn_2024: number
}

async function export2024TaxData() {
  const supabase = createAdminClient()

  console.log('Fetching projects and creators...')

  // Fetch all projects with their creator profiles
  const { data: projects } = await supabase
    .from('projects')
    .select(
      'id, title, location_description, creator, profiles!projects_creator_fkey(id, full_name)'
    )
    .throwOnError()

  console.log(`Found ${projects.length} projects`)

  // Fetch all withdrawals from 2024
  const { data: withdrawals } = await supabase
    .from('txns')
    .select('from_id, amount')
    .eq('type', 'withdraw')
    .gte('created_at', '2024-01-01T00:00:00.000Z')
    .lt('created_at', '2025-01-01T00:00:00.000Z')
    .throwOnError()

  console.log(`Found ${withdrawals.length} withdrawals in 2024`)

  // Group withdrawals by creator (from_id is the person withdrawing)
  const withdrawalsByCreator = new Map<string, number>()
  for (const withdrawal of withdrawals) {
    if (withdrawal.from_id) {
      const currentTotal = withdrawalsByCreator.get(withdrawal.from_id) || 0
      withdrawalsByCreator.set(
        withdrawal.from_id,
        currentTotal + withdrawal.amount
      )
    }
  }

  console.log(`Withdrawals by ${withdrawalsByCreator.size} unique creators`)

  // Group projects by creator
  const projectsByCreator = new Map<string, Array<any>>()
  for (const project of projects) {
    const profile = project.profiles as any
    const creatorId = profile?.id || project.creator

    if (!projectsByCreator.has(creatorId)) {
      projectsByCreator.set(creatorId, [])
    }
    projectsByCreator.get(creatorId)!.push({
      title: project.title || '',
      id: project.id,
      location: project.location_description || 'US',
      profile: profile,
    })
  }

  console.log(`Projects grouped by ${projectsByCreator.size} unique creators`)

  // Combine data - one row per creator
  const results: RecipientWithProjectsAndWithdrawals[] = []
  for (const [creatorId, creatorProjects] of Array.from(
    projectsByCreator.entries()
  )) {
    const totalWithdrawn = withdrawalsByCreator.get(creatorId) || 0
    const firstProject = creatorProjects[0]

    // Concatenate project titles with '; '
    const projectTitles = creatorProjects.map((p: any) => p.title).join('; ')

    // Concatenate project IDs with '; '
    const projectIds = creatorProjects.map((p: any) => p.id).join('; ')

    // Get unique locations and concatenate with '; '
    const uniqueLocations = Array.from(
      new Set(creatorProjects.map((p: any) => p.location))
    )
    const projectLocations = uniqueLocations.join('; ')

    results.push({
      project_titles: projectTitles,
      project_ids: projectIds,
      project_locations: projectLocations,
      creator_name: firstProject.profile?.full_name || '',
      creator_id: creatorId,
      total_withdrawn_2024: totalWithdrawn,
    })
  }

  // Generate CSV
  const csvHeader =
    'Project Titles,Project IDs,Project Locations,Creator Name,Creator ID,Total Withdrawn 2024\n'
  const csvRows = results.map((row) => {
    return [
      escapeCsvField(row.project_titles),
      escapeCsvField(row.project_ids),
      escapeCsvField(row.project_locations),
      escapeCsvField(row.creator_name),
      escapeCsvField(row.creator_id),
      row.total_withdrawn_2024.toString(),
    ].join(',')
  })

  const csvContent = csvHeader + csvRows.join('\n')

  // Write to file
  const outputPath = path.join(__dirname, '2024-tax-grants.csv')
  fs.writeFileSync(outputPath, csvContent, 'utf-8')

  console.log(`\nExport complete!`)
  console.log(`Output written to: ${outputPath}`)
  console.log(`Total projects: ${results.length}`)
  console.log(
    `Total withdrawn in 2024: $${results
      .reduce((sum, r) => sum + r.total_withdrawn_2024, 0)
      .toLocaleString()}`
  )
}

function escapeCsvField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function main() {
  export2024TaxData().catch((error) => {
    console.error('Failed to export 2024 tax data:', error)
    process.exit(1)
  })
}

main()
