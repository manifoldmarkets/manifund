import { NextRequest } from 'next/server'
import { createAdminClient } from './_db'
import { sendWeeklyDigest } from '@/utils/weekly-digest'
import { isProd } from '@/utils/constants'

export default async function handler(req: NextRequest) {
  console.log('Weekly digest cron job triggered')

  // Only run in production
  if (!isProd()) {
    console.log('Skipping weekly digest: not in production')
    return new Response('Not in production', { status: 200 })
  }

  try {
    const supabase = createAdminClient()
    await sendWeeklyDigest(supabase)
    
    console.log('Weekly digest sent successfully')
    return new Response('Weekly digest sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error sending weekly digest:', error)
    return new Response('Error sending weekly digest', { status: 500 })
  }
}

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}