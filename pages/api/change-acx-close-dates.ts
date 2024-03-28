import { NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

// Used to add txn type column to txns table
export default async function handler() {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('projects')
    .update({ auction_close: '2024-04-05' })
    .match({
      round: 'ACX Grants 2024',
      type: 'cert',
    })
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  return NextResponse.json('success')
}
