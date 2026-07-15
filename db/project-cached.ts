import { revalidateTag, unstable_cache } from 'next/cache'
import { createPublicSupabaseClient } from './supabase-server'
import { getHotProjects } from './project-hot'

export const getHotProjectsCached = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    const result = await getHotProjects(supabase, 20)
    return result
  },
  ['hot-projects'],
  {
    revalidate: 3600, // 1 hr
    tags: ['hot-projects'], // cache key
  }
)

export function invalidateProjectsCache() {
  // revalidateTag is an App Router-only API: called from a Pages Router API
  // route it throws "Invariant: static generation store missing" and 500s the
  // whole request. Swallow that so Pages Router callers survive; the actual
  // revalidation for create/edit/publish happens in /api/score-project (App
  // Router), and the hot-projects cache otherwise expires within an hour.
  try {
    revalidateTag('hot-projects', 'max')
  } catch (error) {
    console.error('invalidateProjectsCache failed (Pages Router context?):', error)
  }
}
