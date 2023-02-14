'use client'

import { useUser } from '@/utils/hooks/use-user'
import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/utils/database.types'
import { useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
type Profile = Database['public']['Tables']['profiles']['Row']

export default function EditProfile() {
  const user = useUser()
  const id = user?.id ?? ''
  const [profile, setProfile] = useState<Profile>({ id, username: null })
  const { supabase } = useSupabase()

  useEffect(() => {
    if (id) {
      getProfile(supabase, id).then((profile) => {
        setProfile(profile)
      })
    }
  }, [id])

  if (!user) {
    return <div>you are not logged in</div>
  }

  return (
    <div>
      this will be the edit profile page
      {JSON.stringify(user, null, 2)}
      <EditProfileForm id={id} profile={profile} />
    </div>
  )
}

async function getProfile(
  supabase: SupabaseClient,
  id: string
): Promise<{ id: string; username: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
  if (error) {
    throw error
  }
  return data[0] ? data[0] : { id, username: null }
}

async function saveProfile(new_profile: Profile) {
  const { supabase } = useSupabase()
  const { error } = await supabase
    .from('profiles')
    .update(new_profile)
    .eq('id', new_profile.id)
  if (error) {
    throw error
  }
}

function EditProfileForm(props: { id: string; profile: Profile }) {
  const { id, profile } = props
  const [username, setUsername] = useState<string | null>(profile.username)

  return (
    <form onSubmit={() => saveProfile({ id, username })}>
      <label htmlFor="username">Name</label>
      <input
        type="text"
        id="username"
        autoComplete="off"
        required
        value={username ? username : ''}
        onChange={(event) => setUsername(event.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  )
}
