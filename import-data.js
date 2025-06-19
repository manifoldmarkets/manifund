import { createClient } from '@supabase/supabase-js'

// Production database credentials
const PROD_URL = 'https://fkousziwzbnkdkldjper.supabase.co'
const PROD_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrb3Vzeml3emJua2RrbGRqcGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3NzgyMzg3NSwiZXhwIjoxOTkzMzk5ODc1fQ.wSrkQYQ7aVewAk0LmWPb8RX1cDjQ5t76M79tLAxHv0o'

// Local database credentials
const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const prodClient = createClient(PROD_URL, PROD_SERVICE_KEY)
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function importData() {
  console.log('Starting data import...')

  try {
    // Import profiles first (no dependencies)
    console.log('Importing profiles...')
    const { data: profiles, error: profilesError } = await prodClient
      .from('profiles')
      .select('*')
      .limit(20) // Import more profiles to handle foreign keys

    if (profilesError) throw profilesError

    if (profiles && profiles.length > 0) {
      const { error: insertError } = await localClient
        .from('profiles')
        .upsert(profiles, { onConflict: 'id' })

      if (insertError) throw insertError
      console.log(`Imported ${profiles.length} profiles`)
    }

    // Import causes (depends on profiles)
    console.log('Importing causes...')
    const { data: causes, error: causesError } = await prodClient
      .from('causes')
      .select('*')

    if (causesError) throw causesError

    if (causes && causes.length > 0) {
      const { error: insertError } = await localClient
        .from('causes')
        .upsert(causes, { onConflict: 'slug' })

      if (insertError) {
        console.log('Causes import error:', insertError)
        // Try importing without fund_id to avoid foreign key issues
        const causesWithoutFundId = causes.map((cause) => ({
          ...cause,
          fund_id: null,
        }))

        const { error: retryError } = await localClient
          .from('causes')
          .upsert(causesWithoutFundId, { onConflict: 'slug' })

        if (retryError) throw retryError
        console.log(`Imported ${causes.length} causes (without fund_id)`)
      } else {
        console.log(`Imported ${causes.length} causes`)
      }
    }

    // Import projects (depends on profiles)
    console.log('Importing projects...')
    const { data: projects, error: projectsError } = await prodClient
      .from('projects')
      .select('*')
      .limit(30) // Import more projects

    if (projectsError) throw projectsError

    if (projects && projects.length > 0) {
      const { error: insertError } = await localClient
        .from('projects')
        .upsert(projects, { onConflict: 'id' })

      if (insertError) throw insertError
      console.log(`Imported ${projects.length} projects`)
    }

    // Import project_causes (depends on both projects and causes)
    console.log('Importing project_causes...')
    const { data: projectCauses, error: projectCausesError } = await prodClient
      .from('project_causes')
      .select('*')
      .limit(100)

    if (projectCausesError) throw projectCausesError

    if (projectCauses && projectCauses.length > 0) {
      const { error: insertError } = await localClient
        .from('project_causes')
        .upsert(projectCauses, { onConflict: 'project_id,cause_slug' })

      if (insertError) throw insertError
      console.log(`Imported ${projectCauses.length} project_causes`)
    }

    // Import some comments
    console.log('Importing comments...')
    const { data: comments, error: commentsError } = await prodClient
      .from('comments')
      .select('*')
      .limit(50)

    if (commentsError) throw commentsError

    if (comments && comments.length > 0) {
      const { error: insertError } = await localClient
        .from('comments')
        .upsert(comments, { onConflict: 'id' })

      if (insertError) throw insertError
      console.log(`Imported ${comments.length} comments`)
    }

    // Import some bids
    console.log('Importing bids...')
    const { data: bids, error: bidsError } = await prodClient
      .from('bids')
      .select('*')
      .limit(50)

    if (bidsError) throw bidsError

    if (bids && bids.length > 0) {
      const { error: insertError } = await localClient
        .from('bids')
        .upsert(bids, { onConflict: 'id' })

      if (insertError) throw insertError
      console.log(`Imported ${bids.length} bids`)
    }

    console.log('Data import completed successfully!')
  } catch (error) {
    console.error('Error importing data:', error)
  }
}

importData()
