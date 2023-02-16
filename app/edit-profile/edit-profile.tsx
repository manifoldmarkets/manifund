'use client'

import { useSupabase } from '@/components/supabase-provider'
import { Database } from '@/utils/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { useState } from 'react'
import uuid from 'react-uuid'

export type Profile = Database['public']['Tables']['profiles']['Row']

export function EditProfileForm(props: { profile: Profile }) {
  const { profile } = props
  const { supabase } = useSupabase()
  const [username, setUsername] = useState<string | null>(profile.username)
  const [avatar, setAvatar] = useState<File | null>(null)

  return (
    <div className="text-red-500">
      <label htmlFor="username">Name</label>
      <input
        type="text"
        id="username"
        autoComplete="off"
        required
        value={username ? username : ''}
        onChange={(event) => setUsername(event.target.value)}
      />
      <label htmlFor="avatar">Choose a profile picture:</label>
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg"
        onChange={(event) => {
          setAvatar(event.target.files ? event.target.files[0] : null)
        }}
      ></input>
      <button
        type="submit"
        onClick={() =>
          saveProfile({ id: profile.id, username }, avatar, supabase)
        }
      >
        Save
      </button>
    </div>
  )
}

async function saveProfile(
  new_profile: Profile,
  avatar: File | null,
  supabase: SupabaseClient
) {
  saveAvatar(avatar, new_profile.id, supabase)
  const { error } = await supabase
    .from('profiles')
    .update({ username: new_profile.username })
    .eq('id', new_profile.id)
  if (error) {
    throw error
  }
}

async function saveAvatar(
  avatar: File | null,
  id: string,
  supabase: SupabaseClient
) {
  if (!avatar) return
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${id}/avatar`, avatar)
  if (error) {
    throw error
  }
  console.log(data)
}
