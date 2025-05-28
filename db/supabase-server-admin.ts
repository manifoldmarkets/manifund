import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/db/database.types'
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@/db/env'
import { getUser, isAdmin } from './profile'
import { createServerSupabaseClient } from './supabase-server'
import { cache } from 'react'

export const createAuthorizedAdminClient = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)

  if (!user || !isAdmin(user)) {
    throw new Error('Unauthorized: Admin access required')
  }

  return createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
})
