import { revalidateTag, unstable_cache } from 'next/cache'
import { listLiteProjects } from './project'
import { createPublicSupabaseClient } from './supabase-server'

function getObjectSizeInBytes(obj: any): number {
  const jsonString = JSON.stringify(obj)
  return new TextEncoder().encode(jsonString).length
}

// Cached version of listLiteProjects for public pages
export const listLiteProjectsCached = unstable_cache(
  // eslint-disable-next-line require-await
  async () => {
    const supabase = createPublicSupabaseClient()
    const projects = await listLiteProjects(supabase)
    const sizeInBytes = getObjectSizeInBytes(projects)
    const sizeInMB = sizeInBytes / (1024 * 1024)
    if (sizeInMB > 1.5) {
      console.warn(
        `[listLiteProjectsCached] WARNING: size appraoching limit (${sizeInMB.toFixed(
          2
        )}MB) / 2MB.`
      )
    }

    return projects
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
