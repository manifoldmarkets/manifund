import { createClient } from '@/db/supabase-server'
import { Profile } from '@/db/profile'
import { getProfileByUsername } from '@/db/profile'

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const supabase = createClient()
  const user = await getProfileByUsername(supabase, usernameSlug)
  return <div>{user?.username} profile page</div>
}
