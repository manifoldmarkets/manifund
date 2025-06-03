#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'
import { Database } from '../db/database.types'
import { writeFileSync } from 'fs'
import { stringify } from 'csv-stringify/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('Make sure to run this with: npm run identify:similar')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function identifySimilarProjects() {
  try {
    console.log('Identifying similar projects...')

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, slug')
      .not('stage', 'in', '("hidden","draft")')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return
    }

    if (!projects || projects.length === 0) {
      console.log('No projects found')
      return
    }

    console.log(`Found ${projects.length} projects to analyze`)

    const csvData = []
    const headers = [
      'Project Title',
      'Project Slug',
      'Similar Project 1',
      'Similarity Score 1',
      'Similar Project 2',
      'Similarity Score 2',
      'Similar Project 3',
      'Similarity Score 3',
    ]

    let processedCount = 0

    for (const project of projects) {
      processedCount++
      console.log(
        `[${processedCount}/${projects.length}] Processing: ${project.title}`
      )

      const { data: similarProjects, error: similarError } = await supabase.rpc(
        'find_similar_projects',
        {
          project_id: project.id,
          match_count: 3,
        }
      )

      if (similarError) {
        console.error(
          `Error finding similar projects for "${project.title}":`,
          similarError
        )
        csvData.push([project.title, project.slug, '', '', '', '', '', ''])
        continue
      }

      const row = [project.title, project.slug]

      if (similarProjects && similarProjects.length > 0) {
        for (let i = 0; i < 3; i++) {
          if (i < similarProjects.length) {
            const similar = similarProjects[i]
            row.push(similar.title)
            row.push(similar.similarity?.toFixed(3) || '0.000')
          } else {
            row.push('', '')
          }
        }
      } else {
        row.push('', '', '', '', '', '')
      }

      csvData.push(row)

      if (processedCount % 50 === 0) {
        console.log(
          `Progress: ${processedCount}/${projects.length} projects processed`
        )
      }
    }

    const csvString = stringify([headers, ...csvData])

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `similar-projects-${timestamp}.csv`
    writeFileSync(filename, csvString)

    console.log(`Analysis complete!`)
    console.log(`CSV file generated: ${filename}`)
    console.log(`Total projects processed: ${csvData.length}`)

    const projectsWithSimilar = csvData.filter((row) => row[2] !== '').length
    const averageSimilarityScore =
      csvData
        .filter((row) => row[3] !== '')
        .reduce((sum, row) => sum + parseFloat(row[3] as string), 0) /
        projectsWithSimilar || 0

    console.log(
      `Projects with similar matches: ${projectsWithSimilar}/${csvData.length}`
    )
    if (averageSimilarityScore > 0) {
      console.log(
        `Average similarity score: ${averageSimilarityScore.toFixed(3)}`
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: bun run identify:similar

Generates a CSV with similarity scores for all projects: similar-projects-YYYY-MM-DD.csv

Note: Make sure you have embeddings generated for your projects first: 'bun run embeddings:sync'.
`)
  process.exit(0)
}

identifySimilarProjects()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
