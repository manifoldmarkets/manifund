import { createAdminClient } from '../pages/api/_db'
import {
  getNewProjectsLastWeek,
  generateProjectListHtml,
  formatWeekRange,
  getRegrantorEmails,
  sendWeeklyDigest,
} from '../utils/weekly-digest'

async function testWeeklyDigest() {
  console.log('Testing weekly digest functionality...')

  const supabase = createAdminClient()

  try {
    // Test getting new projects
    const projects = await getNewProjectsLastWeek(supabase)
    console.log(`Found ${projects.length} projects from the last week`)

    if (projects.length > 0) {
      console.log('Sample project:', {
        title: projects[0].title,
        creator:
          projects[0].profiles?.full_name || projects[0].profiles?.username,
        created_at: projects[0].created_at,
        blurb: projects[0].blurb?.substring(0, 100) + '...',
      })
    }

    // Test HTML generation
    const html = generateProjectListHtml(projects)
    console.log('Generated HTML length:', html.length)

    // Test date formatting
    const { weekStart, weekEnd } = formatWeekRange()
    console.log('Week range:', `${weekStart} - ${weekEnd}`)

    // Test actually sending the email
    // await sendWeeklyDigest(supabase)
    // console.log('Sent weekly digest -- check your email!')

    // Log regrantor emails
    // const regrantorEmails = await getRegrantorEmails(supabase, 2025)
    // console.log('Regrantor emails:', regrantorEmails)

    console.log('✅ All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

void testWeeklyDigest()
