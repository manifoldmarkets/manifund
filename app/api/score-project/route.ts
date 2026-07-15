import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { updateProjectEmbedding } from '@/app/utils/embeddings'
import { scoreProject } from '@/app/utils/project-scores'
import { createAdminSupabaseClient } from '@/db/supabase-server'
import { invalidateProjectsCache } from '@/db/project-cached'

// Embeds and slop-scores a single project in the background. The on-create/
// on-edit hooks live in Pages Router edge functions, where waitUntil doesn't
// reliably outlive the response and Pangram's ~2min polling exceeds edge
// limits anyway - so they instead await a quick fetch to this Node route,
// which ACKs with a 202 and finishes the work via waitUntil.
export const maxDuration = 300

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = (await request.json()) as { projectId?: string }
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  // The Pages Router callers can't revalidateTag themselves (App Router-only
  // API), so the projects cache is refreshed here on their behalf
  invalidateProjectsCache()

  waitUntil(
    updateProjectEmbedding(projectId).catch((error) => {
      console.error(`Failed to embed project ${projectId}:`, error)
    })
  )
  waitUntil(
    scoreProject(createAdminSupabaseClient(), projectId).catch((error) => {
      console.error(`Failed to score project ${projectId}:`, error)
    })
  )

  return NextResponse.json({ started: true, projectId }, { status: 202 })
}
