import 'server-only'

import { headers, cookies } from 'next/headers'
import {
  createServerComponentSupabaseClient,
  SupabaseClient,
} from '@supabase/auth-helpers-nextjs'

import type { Database } from './database.types'

export const createClient = () =>
  createServerComponentSupabaseClient<Database>({
    headers,
    cookies,
  })

export async function getUser(supabase: SupabaseClient<Database>) {
  const resp = await supabase.auth.getUser()
  return resp.data.user
}
