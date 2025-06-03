#!/usr/bin/env bun
const SERVER_PORT = process.env.PORT || 3000
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === 'true'
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '5')

async function syncEmbeddings() {
  const serverUrl = `http://localhost:${SERVER_PORT}`

  try {
    console.log('Starting local embedding sync...')

    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log(`Force regenerate: ${FORCE_REGENERATE}`)
    console.log(`Server port: ${SERVER_PORT}`)
    console.log()

    const startTime = Date.now()
    console.log('Starting embedding sync...')
    const params = new URLSearchParams({
      batchSize: BATCH_SIZE.toString(),
      force: FORCE_REGENERATE.toString(),
    })

    const response = await fetch(`${serverUrl}/api/embeddings/sync?${params}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer test-key',
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      throw new Error(
        `Sync failed: ${response.status} - ${
          errorData.error || errorData.details || 'Unknown error'
        }`
      )
    }

    const result = await response.json()
    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log('\nEmbedding sync completed successfully!')
    console.log(`Results:`)
    console.log(`   • Processed: ${result.results.processed}`)
    console.log(`   • Errors: ${result.results.errors}`)
    console.log(`   • Total: ${result.results.total}`)
    console.log(`   • Model: ${result.model}`)
    console.log(`   • Duration: ${duration}s`)

    if (result.results.errors > 0) {
      console.log(
        '\nSome embeddings failed to generate. Check the server logs for details.'
      )
      process.exit(1)
    }
  } catch (error) {
    console.error('Embedding sync failed:', error)
    process.exit(1)
  }
}

void syncEmbeddings()
