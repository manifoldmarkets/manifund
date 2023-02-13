import 'server-only'

import { createClient } from '../../utils/supabase-server'
import Posts from './posts'

// do not cache this page
export const revalidate = 0

export default async function Realtime() {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select('*')

  return <Posts serverPosts={data || []} />
}