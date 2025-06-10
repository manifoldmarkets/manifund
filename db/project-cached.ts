import { revalidateTag, unstable_cache } from 'next/cache'
import { listProjects } from './project'
import { createPublicSupabaseClient } from './supabase-server'

// Cached version of listProjects for public pages
export const listProjectsCached = unstable_cache(
  // eslint-disable-next-line @typescript-eslint/require-await
  async () => {
    const supabase = createPublicSupabaseClient()
    return listProjects(supabase)
  },
  ['list-projects'], // cache key
  {
    revalidate: 30, // in seconds
    tags: ['projects'], // for invalidation
  }
)

export function invalidateProjectsCache() {
  revalidateTag('projects')
}
