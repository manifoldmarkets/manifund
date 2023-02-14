'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/utils/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase } = useSupabase()
  console.log('supabase', supabase)
  const [username, setUsername] = useState<string | null>(profile.username)

  return (
    <div className="text-red-500">
      {/* <form
        onSubmit={() => saveProfile({ id: profile.id, username }, supabase)}
      > */}
      <label htmlFor="username">Name</label>
      <input
        type="text"
        id="username"
        autoComplete="off"
        required
        value={username ? username : ''}
        onChange={(event) => setUsername(event.target.value)}
      />
      <button
        type="submit"
        onClick={() => saveProfile({ id: profile.id, username }, supabase)}
      >
        Save
      </button>
      {/* </form> */}
    </div>
  )
}

async function saveProfile(new_profile: Profile, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('profiles')
    .update({ username: new_profile.username })
    .eq('id', new_profile.id)
  if (error) {
    throw error
  }
}
