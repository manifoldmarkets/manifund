// Backfill slop scores (Pangram + Sonnet judge) for all public projects.
// Resumable: already-scored projects are skipped via content_hash.
// Run with: bun run scripts/backfill-scores.ts
import { createAdminClient } from '@/db/edge'
import { syncProjectScores } from '@/app/utils/project-scores'

async function main() {
  const supabase = createAdminClient()
  let round = 1
  while (true) {
    console.log(`\n=== Round ${round} ===`)
    const results = await syncProjectScores(supabase, {
      batchSize: 8,
      limit: 200,
      onProgress: ({ processed, total, currentProject }) => {
        console.log(`  ${processed}/${total} ${currentProject ?? ''}`)
      },
    })
    console.log(
      `Round ${round}: ${results.scored} scored, ${results.partial} partial, ${results.failed} failed`
    )
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors.slice(0, 10))
    }
    // Stop when nothing is left, or when everything remaining fails/partials
    // (persistent failures would otherwise loop forever)
    if (results.total === 0 || results.scored === 0) break
    round++
  }
  console.log('\nBackfill done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
