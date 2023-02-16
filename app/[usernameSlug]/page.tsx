import { createClient } from '@/utils/supabase-server'
import { Profile } from '../edit-profile/edit-profile'

export default async function UserProfilePage(props: {
  params: { usernameSlug: string }
}) {
  const { usernameSlug } = props.params
  const user = await getProfile(usernameSlug)
  return <div>{user?.username} profile page</div>
}

export async function getProfile(username: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
  if (error) {
    throw error
  }
  return data[0] as Profile
}
