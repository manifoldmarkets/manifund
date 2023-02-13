import 'server-only'

import { createClient } from '@/utils/supabase-server'
import { Database } from '@/utils/database.types'

// do not cache this page
export const revalidate = 0

export default async function ServerComponent() {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select('*')
  const posts = data ? data.map((post) => Post(post)) : <li>no posts</li>

  return (
    <>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
      <ul>{posts}</ul>
    </>
  )
}

type PostProps = Database['public']['Tables']['posts']['Row']

function Post(props: PostProps) {
  return (
    <li className="bg-rose-200 p-5 m-5 flex-col gap-5 text-center">
      <h1 className="text-xl">{props.title}</h1>
      <div>{props.content}</div>
      <div>{props.created_at}</div>
    </li>
  )
}
