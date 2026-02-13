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
  revalidateTag('hot-projects', 'max')
}
