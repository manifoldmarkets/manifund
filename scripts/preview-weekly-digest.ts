import { writeFileSync } from 'fs'
import { createAdminClient } from '@/db/edge'
import {
  getNewProjectsLastWeek,
  getNotableCommentsLastWeek,
  getNotableGrantsLastWeek,
  generateHtmlDigest,
} from '../utils/weekly-digest'

async function previewWeeklyDigest() {
  const supabase = createAdminClient()

  const [projects, notableComments, notableGrants] = await Promise.all([
    getNewProjectsLastWeek(supabase),
    getNotableCommentsLastWeek(supabase, 15),
    getNotableGrantsLastWeek(supabase, 15),
  ])

  console.log(
    `Found ${projects.length} projects, ${notableComments.length} comments, ${notableGrants.length} grants`
  )

  const html = generateHtmlDigest(projects, notableComments, notableGrants)
  const outPath = '/tmp/digest-preview.html'
  writeFileSync(outPath, html)
  console.log(`Wrote preview to ${outPath}`)
}

void previewWeeklyDigest()
