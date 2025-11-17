import { unstable_cache } from 'next/cache'
import { createPublicSupabaseClient } from './supabase-server'
import { getHotProjects } from './project-hot'
import { getRecentFullComments } from './comment'
import { getRecentFullTxns } from './txn'
import { getRecentFullBids } from './bid'
import { listSimpleCauses } from './cause'

// Cache hot projects for 1 hour
export const getCachedHotProjects = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    return await getHotProjects(supabase, 16)
  },
  ['home-hot-projects'],
  {
    revalidate: 3600, // 1 hour
    tags: ['home-hot-projects'],
  }
)

// Cache recent comments for 5 minutes
export const getCachedRecentComments = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    return await getRecentFullComments(supabase, 10, 0)
  },
  ['home-recent-comments'],
  {
    revalidate: 300, // 5 minutes
    tags: ['home-recent-comments'],
  }
)

// Cache recent donations for 5 minutes
export const getCachedRecentDonations = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    return await getRecentFullTxns(supabase, 10, 0)
  },
  ['home-recent-donations'],
  {
    revalidate: 300, // 5 minutes
    tags: ['home-recent-donations'],
  }
)

// Cache recent bids for 5 minutes
export const getCachedRecentBids = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    return await getRecentFullBids(supabase, 10, 0)
  },
  ['home-recent-bids'],
  {
    revalidate: 300, // 5 minutes
    tags: ['home-recent-bids'],
  }
)

// Cache causes list for 1 hour
export const getCachedCauses = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient()
    return await listSimpleCauses(supabase)
  },
  ['home-causes'],
  {
    revalidate: 3600, // 1 hour
    tags: ['home-causes'],
  }
)
