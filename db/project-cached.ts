import { revalidateTag, unstable_cache } from 'next/cache'
import { listLiteProjects } from './project'
import { createPublicSupabaseClient } from './supabase-server'

// Cached version of listLiteProjects for public pages
export const listLiteProjectsCached = unstable_cache(
  // eslint-disable-next-line require-await
  async () => {
    const supabase = createPublicSupabaseClient()
    return listLiteProjects(supabase)
  },
  ['list-projects-lite'], // cache key
  {
    revalidate: 30, // in seconds
    tags: ['projects'], // for invalidation
  }
)

export function invalidateProjectsCache() {
  revalidateTag('projects')
}
